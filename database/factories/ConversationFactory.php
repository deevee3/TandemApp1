<?php

namespace Database\Factories;

use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'subject' => $this->faker->sentence(),
            'status' => Conversation::STATUS_NEW,
            'priority' => 'standard',
            'requester_type' => 'customer',
            'requester_identifier' => $this->faker->uuid(),
            'metadata' => null,
            'last_activity_at' => now(),
        ];
    }
}
