<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function show(Request $request, Conversation $conversation): Response
    {
        $conversation->load([
            'messages' => fn ($query) => $query
                ->orderBy('created_at')
                ->with('user:id,name'),
            'queueItems' => fn ($query) => $query
                ->with('queue:id,name')
                ->orderByDesc('created_at'),
            'assignments' => fn ($query) => $query
                ->with(['user:id,name', 'queue:id,name'])
                ->orderByDesc('assigned_at'),
            'handoffs' => fn ($query) => $query->orderByDesc('created_at'),
        ]);

        $conversationData = [
            'id' => $conversation->id,
            'subject' => $conversation->subject,
            'status' => $conversation->status,
            'priority' => $conversation->priority,
            'last_activity_at' => optional($conversation->last_activity_at)->toIso8601String(),
            'requester' => [
                'type' => $conversation->requester_type,
                'identifier' => $conversation->requester_identifier,
            ],
            'metadata' => $conversation->metadata,
        ];

        return Inertia::render('conversation', [
            'conversation' => $conversationData,
            'messages' => $conversation->messages->map(function ($message) {
                return [
                    'id' => $message->id,
                    'sender_type' => $message->sender_type,
                    'content' => $message->content,
                    'confidence' => $message->confidence,
                    'metadata' => $message->metadata,
                    'created_at' => optional($message->created_at)->toIso8601String(),
                    'user' => $message->user ? [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                    ] : null,
                ];
            })->values(),
            'queueItems' => $conversation->queueItems->map(function ($queueItem) {
                return [
                    'id' => $queueItem->id,
                    'queue_id' => $queueItem->queue_id,
                    'state' => $queueItem->state,
                    'enqueued_at' => optional($queueItem->enqueued_at)->toIso8601String(),
                    'dequeued_at' => optional($queueItem->dequeued_at)->toIso8601String(),
                    'metadata' => $queueItem->metadata,
                    'queue' => $queueItem->queue ? [
                        'id' => $queueItem->queue->id,
                        'name' => $queueItem->queue->name,
                    ] : null,
                ];
            })->values(),
            'assignments' => $conversation->assignments->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'status' => $assignment->status,
                    'assigned_at' => optional($assignment->assigned_at)->toIso8601String(),
                    'accepted_at' => optional($assignment->accepted_at)->toIso8601String(),
                    'released_at' => optional($assignment->released_at)->toIso8601String(),
                    'resolved_at' => optional($assignment->resolved_at)->toIso8601String(),
                    'metadata' => $assignment->metadata,
                    'user' => $assignment->user ? [
                        'id' => $assignment->user->id,
                        'name' => $assignment->user->name,
                    ] : null,
                    'queue' => $assignment->queue ? [
                        'id' => $assignment->queue->id,
                        'name' => $assignment->queue->name,
                    ] : null,
                ];
            })->values(),
            'handoffs' => $conversation->handoffs->map(function ($handoff) {
                return [
                    'id' => $handoff->id,
                    'reason_code' => $handoff->reason_code,
                    'confidence' => $handoff->confidence,
                    'policy_hits' => $handoff->policy_hits,
                    'required_skills' => $handoff->required_skills,
                    'metadata' => $handoff->metadata,
                    'created_at' => optional($handoff->created_at)->toIso8601String(),
                ];
            })->values(),
        ]);
    }
}
