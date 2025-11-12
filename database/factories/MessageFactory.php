<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'sender_type' => Message::SENDER_AGENT,
            'user_id' => null,
            'content' => $this->faker->paragraph(),
            'confidence' => $this->faker->randomFloat(2, 0, 1),
            'cost_usd' => $this->faker->randomFloat(4, 0, 0.1),
            'metadata' => ['source' => 'factory'],
        ];
    }

    public function requester(): self
    {
        return $this->state(fn () => [
            'sender_type' => Message::SENDER_REQUESTER,
        ]);
    }

    public function human(): self
    {
        return $this->state(fn () => [
            'sender_type' => Message::SENDER_HUMAN,
        ]);
    }
}
