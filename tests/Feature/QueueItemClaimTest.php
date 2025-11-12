<?php

use App\Models\Conversation;
use App\Models\Queue;
use App\Models\QueueItem;
use App\Models\User;
use Illuminate\Support\Arr;

it('allows claiming a queued item and transitions state', function () {
    $queue = Queue::factory()->create();

    $conversation = Conversation::factory()->create([
        'status' => Conversation::STATUS_QUEUED,
    ]);

    $queueItem = QueueItem::factory()
        ->for($queue)
        ->for($conversation)
        ->queued()
        ->create();

    $actor = User::factory()->create();
    $assignee = User::factory()->create();

    $plainKey = issuePlainApiKey();

    $response = $this->withHeaders([
        'X-Api-Key' => $plainKey,
    ])->postJson("/api/queues/{$queue->id}/items/{$queueItem->id}/claim", [
        'actor_id' => $actor->id,
        'assignment_user_id' => $assignee->id,
        'assignment_metadata' => ['channel' => 'api'],
    ]);

    $response->assertOk();

    $payload = $response->json('data');
    expect($payload)->toBeArray();
    expect($payload['state'])->toBe(QueueItem::STATE_HOT);
    expect(Arr::get($payload, 'conversation.status'))->toBe(Conversation::STATUS_ASSIGNED);

    $this->assertDatabaseHas('queue_items', [
        'id' => $queueItem->id,
        'state' => QueueItem::STATE_HOT,
    ]);

    $this->assertDatabaseHas('assignments', [
        'conversation_id' => $conversation->id,
        'user_id' => $assignee->id,
        'status' => 'assigned',
    ]);
});

it('rejects claims for items not in queued state', function () {
    $queue = Queue::factory()->create();

    $conversation = Conversation::factory()->create([
        'status' => Conversation::STATUS_ASSIGNED,
    ]);

    $queueItem = QueueItem::factory()
        ->for($queue)
        ->for($conversation)
        ->hot()
        ->create();

    $actor = User::factory()->create();

    $plainKey = issuePlainApiKey();

    $response = $this->withHeaders([
        'X-Api-Key' => $plainKey,
    ])->postJson("/api/queues/{$queue->id}/items/{$queueItem->id}/claim", [
        'actor_id' => $actor->id,
        'assignment_user_id' => $actor->id,
    ]);

    $response->assertStatus(409);
    $response->assertJsonFragment([
        'message' => 'Queue item cannot be claimed in its current state.',
    ]);
});
