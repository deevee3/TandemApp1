<?php

use App\Models\ApiKey;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Queue;
use App\Models\QueueItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

it('lists queue items with pagination and latest message context', function () {
    $queue = Queue::factory()->create();
    $otherQueue = Queue::factory()->create();

    /** @var Conversation $conversation */
    $conversation = Conversation::factory()->create([
        'subject' => 'Escalated billing question',
        'status' => 'queued',
        'priority' => 'high',
        'requester_type' => 'customer',
        'requester_identifier' => 'cust_909',
        'last_activity_at' => now()->subMinutes(5),
    ]);

    $conversation->messages()->create([
        'sender_type' => Message::SENDER_AGENT,
        'user_id' => null,
        'content' => 'Initial automated reply.',
        'confidence' => 0.74,
        'cost_usd' => 0.01,
        'metadata' => ['note' => 'auto'],
        'created_at' => now()->subMinutes(20),
        'updated_at' => now()->subMinutes(20),
    ]);

    $conversation->messages()->create([
        'sender_type' => Message::SENDER_HUMAN,
        'user_id' => null,
        'content' => 'We are reviewing this conversation now.',
        'confidence' => null,
        'cost_usd' => null,
        'metadata' => ['note' => 'latest'],
        'created_at' => now()->subMinutes(4),
        'updated_at' => now()->subMinutes(4),
    ]);

    QueueItem::factory()->for($queue)->for($conversation)->queued()->create([
        'enqueued_at' => Carbon::now()->subMinutes(10),
        'metadata' => ['ticket' => 'INC-1234'],
    ]);

    QueueItem::factory()->for($otherQueue)->queued()->create();

    $plainKey = issuePlainApiKey();

    $response = $this->withHeaders([
        'X-Api-Key' => $plainKey,
    ])->getJson("/api/queues/{$queue->id}/items?per_page=25");

    $response->assertOk();
    $response->assertJsonStructure([
        'data' => [[
            'id',
            'queue_id',
            'state',
            'enqueued_at',
            'metadata',
            'conversation' => [
                'id',
                'subject',
                'status',
                'priority',
                'last_activity_at',
                'requester' => ['type', 'identifier'],
                'latest_message' => ['id', 'sender_type', 'content', 'confidence', 'metadata', 'created_at'],
            ],
        ]],
        'meta' => [
            'pagination' => ['current_page', 'per_page', 'total', 'last_page'],
            'filters' => ['state'],
        ],
    ]);

    $response->assertJsonFragment([
        'queue_id' => $queue->id,
        'state' => QueueItem::STATE_QUEUED,
    ]);

    $response->assertJsonFragment([
        'subject' => 'Escalated billing question',
        'priority' => 'high',
    ]);

    $firstItem = $response->json('data.0');
    expect($firstItem['metadata'])->toMatchArray(['ticket' => 'INC-1234']);
    expect($firstItem['conversation']['latest_message']['content'])->toBe('We are reviewing this conversation now.');
    expect($firstItem['conversation']['latest_message']['metadata'])->toMatchArray(['note' => 'latest']);
    expect($response->json('meta.pagination.total'))->toBe(1);
    expect($response->json('meta.pagination.per_page'))->toBe(25);
    expect($response->json('meta.filters.state'))->toBeNull();
});

it('filters queue items by state', function () {
    $queue = Queue::factory()->create();

    QueueItem::factory()->for($queue)->queued()->create();
    QueueItem::factory()->for($queue)->hot()->create();

    $plainKey = issuePlainApiKey();

    $response = $this->withHeaders([
        'X-Api-Key' => $plainKey,
    ])->getJson("/api/queues/{$queue->id}/items?state=" . QueueItem::STATE_HOT);

    $response->assertOk();
    $states = collect($response->json('data'))->pluck('state')->unique()->values()->all();
    expect($states)->toBe([QueueItem::STATE_HOT]);
    expect($response->json('meta.filters.state'))->toBe(QueueItem::STATE_HOT);
});

function issuePlainApiKey(): string
{
    $plain = 'test_' . Str::random(24);

    ApiKey::query()->create([
        'name' => 'Test Key',
        'key' => hash('sha256', $plain),
        'scopes' => [],
        'active' => true,
    ]);

    return $plain;
}
