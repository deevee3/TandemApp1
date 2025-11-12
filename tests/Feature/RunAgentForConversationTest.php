<?php

use App\Jobs\RunAgentForConversation;
use App\Models\Conversation;
use App\Models\ApiKey;
use App\Models\Queue;
use App\Models\QueueItem;
use App\Models\User;
use App\Services\AgentRunResult;
use App\Services\AgentRunnerService;
use App\Services\PolicyEvaluationResult;
use App\Services\PolicyEvaluationService;
use Illuminate\Support\Str;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Mockery;
use SM\Factory\FactoryInterface;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

afterEach(function () {
    Mockery::close();
});

it('creates an agent message when the runner succeeds without handoff', function () {
    $conversation = Conversation::factory()->create([
        'status' => Conversation::STATUS_AGENT_WORKING,
    ]);

    $runner = Mockery::mock(AgentRunnerService::class);
    $runner->shouldReceive('run')
        ->once()
        ->with(Mockery::on(fn ($argument) => $argument->is($conversation)))
        ->andReturn(AgentRunResult::success([
            'response' => 'Here is the update you requested.',
            'confidence' => 0.92,
            'handoff' => false,
            'reason' => 'resolution',
            'policy_flags' => [],
        ]));

    $job = new RunAgentForConversation($conversation->id);
    $factory = app(FactoryInterface::class);

    $evaluationService = Mockery::mock(PolicyEvaluationService::class);

    $evaluationService->shouldReceive('evaluateAgentResponse')
        ->once()
        ->with(Mockery::on(fn ($argument) => $argument->is($conversation)), Mockery::type('array'))
        ->andReturn(new PolicyEvaluationResult(false, 'resolution', 0.92));

    $job->handle($runner, $factory, $evaluationService);

    $conversation->refresh();

    assertDatabaseCount('messages', 1);
    assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'sender_type' => 'agent',
        'content' => 'Here is the update you requested.',
    ]);

    assertDatabaseCount('handoffs', 0);
    assertDatabaseCount('queue_items', 0);

    expect($conversation->status)->toBe(Conversation::STATUS_AGENT_WORKING);
});

it('falls back to human handoff when the runner response is malformed', function () {
    $queue = Queue::factory()->create([
        'is_default' => true,
    ]);

    $conversation = Conversation::factory()->create([
        'status' => Conversation::STATUS_AGENT_WORKING,
    ]);

    $runner = Mockery::mock(AgentRunnerService::class);
    $runner->shouldReceive('run')
        ->once()
        ->with(Mockery::on(fn ($argument) => $argument->is($conversation)))
        ->andReturn(AgentRunResult::fallback('Malformed output.'));

    $job = new RunAgentForConversation($conversation->id);
    $factory = app(FactoryInterface::class);

    $evaluationService = Mockery::mock(PolicyEvaluationService::class);

    $evaluationService->shouldReceive('evaluateAgentResponse')
        ->once()
        ->with(Mockery::on(fn ($argument) => $argument->is($conversation)), Mockery::type('array'))
        ->andReturn(new PolicyEvaluationResult(false, 'resolution', 0.92));

    $job->handle($runner, $factory, $evaluationService);

    $conversation->refresh();

    assertDatabaseHas('handoffs', [
        'conversation_id' => $conversation->id,
        'reason_code' => 'uncertain_intent',
    ]);

    assertDatabaseHas('queue_items', [
        'conversation_id' => $conversation->id,
        'queue_id' => $queue->id,
        'state' => QueueItem::STATE_QUEUED,
    ]);

    expect($conversation->status)->toBe(Conversation::STATUS_QUEUED);
});

it('requeues the agent when a conversation returns to the agent loop', function () {
    Bus::fake();

    $queue = Queue::factory()->create();
    $user = User::factory()->create();

    $conversation = Conversation::factory()->create([
        'status' => Conversation::STATUS_HUMAN_WORKING,
    ]);

    DB::table('assignments')->insert([
        'conversation_id' => $conversation->id,
        'queue_id' => $queue->id,
        'user_id' => $user->id,
        'assigned_at' => now()->subMinutes(5),
        'accepted_at' => now()->subMinutes(4),
        'released_at' => null,
        'resolved_at' => null,
        'status' => 'human_working',
        'metadata' => json_encode(['seed' => true]),
        'created_at' => now()->subMinutes(5),
        'updated_at' => now()->subMinutes(4),
    ]);

    $stateMachine = app(FactoryInterface::class)->get($conversation, 'conversation');

    expect($stateMachine->can('return_to_agent'))->toBeTrue();

    $stateMachine->apply('return_to_agent', false, [
        'assignment_user_id' => $user->id,
        'released_at' => now(),
        'channel' => 'system',
        'occurred_at' => now(),
    ]);

    Bus::assertDispatched(RunAgentForConversation::class, function (RunAgentForConversation $job) use ($conversation) {
        return $job->conversationId() === $conversation->id;
    });

    $conversation->refresh();
    expect($conversation->status)->toBe(Conversation::STATUS_BACK_TO_AGENT);
});

it('dispatches the agent runner when releasing an assignment via the API', function () {
    Bus::fake();

    $queue = Queue::factory()->create();
    $actor = User::factory()->create();
    $assignee = User::factory()->create();

    $conversation = Conversation::factory()->create([
        'status' => Conversation::STATUS_HUMAN_WORKING,
    ]);

    DB::table('assignments')->insert([
        'conversation_id' => $conversation->id,
        'queue_id' => $queue->id,
        'user_id' => $assignee->id,
        'assigned_at' => now()->subMinutes(10),
        'accepted_at' => now()->subMinutes(9),
        'released_at' => null,
        'resolved_at' => null,
        'status' => 'human_working',
        'metadata' => json_encode([]),
        'created_at' => now()->subMinutes(10),
        'updated_at' => now()->subMinutes(9),
    ]);

    $assignment = DB::table('assignments')->where('conversation_id', $conversation->id)->first();

    $plainKey = 'test_' . Str::random(24);

    ApiKey::query()->create([
        'name' => 'Test Key',
        'key' => hash('sha256', $plainKey),
        'scopes' => [],
        'active' => true,
    ]);

    $response = $this->withHeaders([
        'X-Api-Key' => $plainKey,
    ])->postJson("/api/assignments/{$assignment->id}/release", [
        'actor_id' => $actor->id,
        'reason' => 'ready_for_agent',
    ]);

    $response->assertOk();

    Bus::assertDispatched(RunAgentForConversation::class, function (RunAgentForConversation $job) use ($conversation) {
        return $job->conversationId() === $conversation->id;
    });

    $conversation->refresh();
    expect($conversation->status)->toBe(Conversation::STATUS_BACK_TO_AGENT);
});
