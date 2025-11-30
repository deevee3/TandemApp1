<?php

namespace Tests\Feature\Api;

use App\Models\ApiKey;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_conversation_with_valid_api_key(): void
    {
        $user = User::factory()->create();
        $plainKey = 'sk_test_1234567890';
        $hashedKey = hash('sha256', $plainKey);

        ApiKey::create([
            'user_id' => $user->id,
            'name' => 'Test Key',
            'key' => $hashedKey,
            'active' => true,
        ]);

        $response = $this->postJson('/api/conversations', [
            'subject' => 'Test Subject',
            'requester' => [
                'type' => 'customer',
                'identifier' => 'cust_123',
            ],
            'initial_message' => [
                'content' => 'Hello world',
            ],
        ], [
            'Authorization' => "Bearer $plainKey",
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['data' => ['id', 'status']]);

        $this->assertDatabaseHas('conversations', [
            'subject' => 'Test Subject',
        ]);
        
        // Verify initial message was created
        $conversation = Conversation::where('subject', 'Test Subject')->first();
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'content' => 'Hello world',
            'sender_type' => 'requester',
        ]);
    }

    public function test_cannot_create_conversation_without_api_key(): void
    {
        $response = $this->postJson('/api/conversations', [
            'subject' => 'Test Subject',
        ]);

        $response->assertStatus(401);
    }
}
