<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\QueueItem */
class QueueItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $conversation = $this->conversation;
        $latestMessage = $conversation?->messages?->first();

        return [
            'id' => $this->id,
            'queue_id' => $this->queue_id,
            'state' => $this->state,
            'enqueued_at' => optional($this->enqueued_at)->toIso8601String(),
            'dequeued_at' => optional($this->dequeued_at)->toIso8601String(),
            'metadata' => $this->metadata,
            'conversation' => $conversation ? [
                'id' => $conversation->id,
                'subject' => $conversation->subject,
                'status' => $conversation->status,
                'priority' => $conversation->priority,
                'last_activity_at' => optional($conversation->last_activity_at)->toIso8601String(),
                'requester' => [
                    'type' => $conversation->requester_type,
                    'identifier' => $conversation->requester_identifier,
                ],
                'latest_message' => $latestMessage ? [
                    'id' => $latestMessage->id,
                    'sender_type' => $latestMessage->sender_type,
                    'content' => $latestMessage->content,
                    'confidence' => $latestMessage->confidence,
                    'metadata' => $latestMessage->metadata,
                    'created_at' => optional($latestMessage->created_at)->toIso8601String(),
                ] : null,
            ] : null,
        ];
    }
}
