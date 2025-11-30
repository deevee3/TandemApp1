<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Jobs\RunAgentForConversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use SM\Factory\FactoryInterface;

class ChatController extends Controller
{
    public function __construct(private readonly FactoryInterface $stateMachineFactory)
    {
    }

    /**
     * Display the public chat page.
     */
    public function show(string $token): Response
    {
        $conversation = Conversation::where('chat_token', $token)->firstOrFail();

        return Inertia::render('chat', [
            'conversation' => [
                'id' => $conversation->id,
                'subject' => $conversation->subject,
                'status' => $conversation->status,
                'chat_token' => $conversation->chat_token,
            ],
            'messages' => $this->formatMessages($conversation),
        ]);
    }

    /**
     * Get updated messages for polling.
     */
    public function messages(string $token): JsonResponse
    {
        $conversation = Conversation::where('chat_token', $token)->firstOrFail();

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'status' => $conversation->status,
            ],
            'messages' => $this->formatMessages($conversation),
        ]);
    }

    /**
     * Send a message from the requester.
     */
    public function sendMessage(Request $request, string $token): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $conversation = Conversation::where('chat_token', $token)->firstOrFail();

        // Don't allow messages on resolved/archived conversations
        if (in_array($conversation->status, [Conversation::STATUS_RESOLVED, Conversation::STATUS_ARCHIVED])) {
            return response()->json([
                'error' => 'This conversation has been resolved.',
            ], 422);
        }

        $message = $conversation->messages()->create([
            'sender_type' => Message::SENDER_REQUESTER,
            'content' => $request->input('content'),
        ]);

        $conversation->update(['last_activity_at' => now()]);

        // If conversation is in a state where the agent can respond, trigger it
        $this->ensureAgentWorking($conversation);

        return response()->json([
            'message' => [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'content' => $message->content,
                'created_at' => $message->created_at?->toIso8601String(),
            ],
            'conversation' => [
                'status' => $conversation->fresh()->status,
            ],
        ], 201);
    }

    /**
     * Format messages for the chat interface.
     */
    private function formatMessages(Conversation $conversation): array
    {
        return $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn (Message $message) => [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'content' => $message->content,
                'created_at' => $message->created_at?->toIso8601String(),
            ])
            ->toArray();
    }

    /**
     * Ensure the agent is working on the conversation if applicable.
     */
    protected function ensureAgentWorking(Conversation $conversation): void
    {
        $stateMachine = $this->stateMachineFactory->get($conversation, 'conversation');

        if ($stateMachine->can('agent_begins')) {
            $stateMachine->apply('agent_begins', false, [
                'channel' => 'chat',
                'occurred_at' => now(),
            ]);

            RunAgentForConversation::dispatch($conversation->id);
        }
    }
}
