<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Queue;
use App\Models\QueueItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QueueItem>
 */
class QueueItemFactory extends Factory
{
    protected $model = QueueItem::class;

    public function definition(): array
    {
        $enqueuedAt = $this->faker->dateTimeBetween('-1 hour', 'now');

        return [
            'queue_id' => Queue::factory(),
            'conversation_id' => Conversation::factory(),
            'state' => QueueItem::STATE_QUEUED,
            'enqueued_at' => $enqueuedAt,
            'dequeued_at' => null,
            'metadata' => ['source' => 'factory'],
        ];
    }

    public function queued(): self
    {
        return $this->state(fn () => [
            'state' => QueueItem::STATE_QUEUED,
            'dequeued_at' => null,
        ]);
    }

    public function hot(): self
    {
        $time = $this->faker->dateTimeBetween('-30 minutes', 'now');

        return $this->state(fn () => [
            'state' => QueueItem::STATE_HOT,
            'dequeued_at' => $time,
        ]);
    }

    public function completed(): self
    {
        $time = $this->faker->dateTimeBetween('-30 minutes', 'now');

        return $this->state(fn () => [
            'state' => QueueItem::STATE_COMPLETED,
            'dequeued_at' => $time,
        ]);
    }
}
