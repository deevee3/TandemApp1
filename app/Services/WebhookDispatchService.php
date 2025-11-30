<?php

namespace App\Services;

use App\Jobs\DispatchWebhook;
use App\Models\Assignment;
use App\Models\Conversation;
use App\Models\Handoff;
use App\Models\Message;
use App\Models\Webhook;
use Illuminate\Support\Facades\Log;

class WebhookDispatchService
{
    /**
     * Dispatch an event to all active webhooks subscribed to that event.
     *
     * @param string $eventType The event type (e.g., 'message.created')
     * @param array<string, mixed> $payload The payload to send
     */
    public function dispatch(string $eventType, array $payload): void
    {
        $webhooks = Webhook::query()
            ->where('active', true)
            ->get()
            ->filter(fn (Webhook $webhook) => in_array($eventType, $webhook->events ?? [], true));

        if ($webhooks->isEmpty()) {
            Log::debug("No active webhooks subscribed to event: {$eventType}");
            return;
        }

        foreach ($webhooks as $webhook) {
            DispatchWebhook::dispatch($webhook, $eventType, $payload);
        }

        Log::info("Queued {$webhooks->count()} webhook(s) for event: {$eventType}");
    }

    /**
     * Build a message.created payload.
     *
     * @param \App\Models\Message $message
     * @return array<string, mixed>
     */
    public function buildMessagePayload(\App\Models\Message $message): array
    {
        return [
            'event' => 'message.created',
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'message' => [
                    'id' => $message->id,
                    'conversation_id' => $message->conversation_id,
                    'sender_type' => $message->sender_type,
                    'content' => $message->content,
                    'created_at' => $message->created_at?->toIso8601String(),
                ],
                'conversation' => [
                    'id' => $message->conversation_id,
                    'subject' => $message->conversation?->subject,
                    'status' => $message->conversation?->status,
                    'requester_type' => $message->conversation?->requester_type,
                    'requester_identifier' => $message->conversation?->requester_identifier,
                ],
            ],
        ];
    }

    /**
     * Dispatch a message.created event.
     */
    public function dispatchMessageCreated(Message $message): void
    {
        $payload = $this->buildMessagePayload($message);
        $this->dispatch('message.created', $payload);
    }

    /**
     * Build a handoff.created payload.
     */
    public function buildHandoffPayload(Handoff $handoff): array
    {
        $handoff->load(['conversation', 'user']);
        
        return [
            'event' => 'handoff.created',
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'handoff' => [
                    'id' => $handoff->id,
                    'conversation_id' => $handoff->conversation_id,
                    'direction' => $handoff->direction,
                    'reason_code' => $handoff->reason_code,
                    'confidence' => $handoff->confidence,
                    'policy_hits' => $handoff->policy_hits,
                    'required_skills' => $handoff->required_skills,
                    'created_at' => $handoff->created_at?->toIso8601String(),
                ],
                'initiated_by' => $handoff->user ? [
                    'id' => $handoff->user->id,
                    'name' => $handoff->user->name,
                    'type' => 'human',
                ] : [
                    'type' => 'agent',
                ],
                'conversation' => [
                    'id' => $handoff->conversation?->id,
                    'subject' => $handoff->conversation?->subject,
                    'status' => $handoff->conversation?->status,
                    'requester_identifier' => $handoff->conversation?->requester_identifier,
                ],
            ],
        ];
    }

    /**
     * Dispatch a handoff.created event.
     */
    public function dispatchHandoffCreated(Handoff $handoff): void
    {
        $payload = $this->buildHandoffPayload($handoff);
        $this->dispatch('handoff.created', $payload);
    }

    /**
     * Build an assignment.created payload.
     */
    public function buildAssignmentPayload(Assignment $assignment): array
    {
        $assignment->load(['conversation', 'user', 'queue']);
        
        return [
            'event' => 'assignment.created',
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'assignment' => [
                    'id' => $assignment->id,
                    'conversation_id' => $assignment->conversation_id,
                    'status' => $assignment->status,
                    'assigned_at' => $assignment->assigned_at?->toIso8601String(),
                    'accepted_at' => $assignment->accepted_at?->toIso8601String(),
                ],
                'assigned_to' => $assignment->user ? [
                    'id' => $assignment->user->id,
                    'name' => $assignment->user->name,
                    'email' => $assignment->user->email,
                ] : null,
                'queue' => $assignment->queue ? [
                    'id' => $assignment->queue->id,
                    'name' => $assignment->queue->name,
                ] : null,
                'conversation' => [
                    'id' => $assignment->conversation?->id,
                    'subject' => $assignment->conversation?->subject,
                    'status' => $assignment->conversation?->status,
                    'requester_identifier' => $assignment->conversation?->requester_identifier,
                ],
            ],
        ];
    }

    /**
     * Dispatch an assignment.created event.
     */
    public function dispatchAssignmentCreated(Assignment $assignment): void
    {
        $payload = $this->buildAssignmentPayload($assignment);
        $this->dispatch('assignment.created', $payload);
    }

    /**
     * Build a conversation.resolved payload.
     */
    public function buildConversationResolvedPayload(Conversation $conversation, ?string $summary = null): array
    {
        return [
            'event' => 'conversation.resolved',
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'conversation' => [
                    'id' => $conversation->id,
                    'subject' => $conversation->subject,
                    'status' => $conversation->status,
                    'priority' => $conversation->priority,
                    'requester_type' => $conversation->requester_type,
                    'requester_identifier' => $conversation->requester_identifier,
                    'created_at' => $conversation->created_at?->toIso8601String(),
                    'resolved_at' => now()->toIso8601String(),
                ],
                'resolution_summary' => $summary,
                'stats' => [
                    'message_count' => $conversation->messages()->count(),
                    'handoff_count' => $conversation->handoffs()->count(),
                ],
            ],
        ];
    }

    /**
     * Dispatch a conversation.resolved event.
     */
    public function dispatchConversationResolved(Conversation $conversation, ?string $summary = null): void
    {
        $payload = $this->buildConversationResolvedPayload($conversation, $summary);
        $this->dispatch('conversation.resolved', $payload);
    }
}
