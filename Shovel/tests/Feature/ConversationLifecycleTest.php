<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use SM\Factory\FactoryInterface;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseCount;

it('orchestrates lifecycle side effects across transitions', function () {
    Carbon::setTestNow(now());

    $conversation = Conversation::factory()->create();
    $user = User::factory()->create();

    $queueId = DB::table('queues')->insertGetId([
        'name' => 'Escalations',
        'slug' => 'escalations-'.uniqid(),
        'description' => 'Test queue',
        'is_default' => false,
        'sla_first_response_minutes' => 15,
        'sla_resolution_minutes' => 120,
        'skills_required' => json_encode(['Compliance']),
        'priority_policy' => json_encode(['high_threshold_minutes' => 60]),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    /** @var FactoryInterface $factory */
    $factory = app(FactoryInterface::class);
    $stateMachine = $factory->get($conversation, 'conversation');

    $stateMachine->apply('agent_begins', false, [
        'actor_id' => $user->id,
        'occurred_at' => now()->subMinutes(10),
    ]);

    $stateMachine->apply('handoff_required', false, [
        'actor_id' => $user->id,
        'reason_code' => 'low_confidence',
        'confidence' => 0.42,
        'policy_hits' => ['term' => 'SSN'],
        'required_skills' => ['Compliance'],
        'handoff_metadata' => ['source' => 'test'],
        'handoff_at' => now()->subMinutes(9),
        'occurred_at' => now()->subMinutes(9),
    ]);

    $stateMachine->apply('enqueue_for_human', false, [
        'actor_id' => $user->id,
        'queue_id' => $queueId,
        'enqueued_at' => now()->subMinutes(8),
        'queue_item_metadata' => ['path' => 'priority'],
    ]);

    $stateMachine->apply('assign_human', false, [
        'actor_id' => $user->id,
        'queue_id' => $queueId,
        'assignment_user_id' => $user->id,
        'assigned_at' => now()->subMinutes(7),
        'assignment_metadata' => ['round_robin' => 2],
    ]);

    $stateMachine->apply('human_accepts', false, [
        'actor_id' => $user->id,
        'assignment_user_id' => $user->id,
        'accepted_at' => now()->subMinutes(6),
    ]);

    $stateMachine->apply('resolve', false, [
        'actor_id' => $user->id,
        'assignment_user_id' => $user->id,
        'resolved_at' => now()->subMinutes(5),
        'resolution_summary' => 'Issue handled in test.',
    ]);

    $stateMachine->apply('archive', false, [
        'actor_id' => $user->id,
        'occurred_at' => now()->subMinutes(4),
    ]);

    $conversation->refresh();
    expect($conversation->status)->toBe(Conversation::STATUS_ARCHIVED);

    assertDatabaseHas('handoffs', [
        'conversation_id' => $conversation->id,
        'reason_code' => 'low_confidence',
    ]);

    assertDatabaseHas('queue_items', [
        'conversation_id' => $conversation->id,
        'queue_id' => $queueId,
        'state' => 'completed',
    ]);

    assertDatabaseHas('assignments', [
        'conversation_id' => $conversation->id,
        'user_id' => $user->id,
        'status' => 'resolved',
    ]);

    assertDatabaseHas('audit_events', [
        'conversation_id' => $conversation->id,
        'event_type' => 'conversation.archive',
    ]);

    assertDatabaseCount('audit_events', 7);
});
