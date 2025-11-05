<?php

namespace App\Services;

use App\Jobs\RunAgentForConversation;
use App\Models\Conversation;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Sebdesign\SM\Event\TransitionEvent;

class ConversationLifecycleService
{
    public function afterAgentBegins(TransitionEvent $event): void
    {
        $conversation = $this->refreshConversation($event);
        $this->touchConversation($conversation, $event, $event->getContext());
        $this->recordAudit($conversation, $event);
    }

    public function afterHandoffRequired(TransitionEvent $event): void
    {
        $conversation = $this->refreshConversation($event);
        $context = $event->getContext();

        $reason = Arr::get($context, 'reason_code');
        if (blank($reason)) {
            throw new InvalidArgumentException('Missing reason_code when triggering handoff_required transition.');
        }

        DB::table('handoffs')->updateOrInsert([
            'conversation_id' => $conversation->id,
            'reason_code' => $reason,
        ], [
            'confidence' => Arr::get($context, 'confidence'),
            'policy_hits' => $this->encodeNullableArray($context, 'policy_hits'),
            'required_skills' => $this->encodeNullableArray($context, 'required_skills'),
            'metadata' => $this->encodeNullableArray($context, 'handoff_metadata'),
            'created_at' => $this->resolveTimestamp($context, 'handoff_at'),
        ]);

        $this->touchConversation($conversation, $event, $context);
        $this->recordAudit($conversation, $event, [
            'reason_code' => $reason,
            'confidence' => Arr::get($context, 'confidence'),
        ]);
    }

    public function afterEnqueueForHuman(TransitionEvent $event): void
    {
        $conversation = $this->refreshConversation($event);
        $context = $event->getContext();

        $queueId = Arr::get($context, 'queue_id');
        if (! $queueId) {
            throw new InvalidArgumentException('Missing queue_id when triggering enqueue_for_human transition.');
        }

        $enqueuedAt = $this->resolveTimestamp($context, 'enqueued_at');

        DB::table('queue_items')->updateOrInsert([
            'queue_id' => $queueId,
            'conversation_id' => $conversation->id,
            'state' => 'queued',
        ], [
            'enqueued_at' => $enqueuedAt,
            'dequeued_at' => null,
            'metadata' => $this->encodeNullableArray($context, 'queue_item_metadata'),
            'created_at' => $enqueuedAt,
            'updated_at' => $enqueuedAt,
        ]);

        $this->touchConversation($conversation, $event, $context);
        $this->recordAudit($conversation, $event, [
            'queue_id' => $queueId,
        ]);
    }

    public function afterAssignHuman(TransitionEvent $event): void
    {
        $conversation = $this->refreshConversation($event);
        $context = $event->getContext();

        $queueId = Arr::get($context, 'queue_id');
        $userId = Arr::get($context, 'assignment_user_id');

        if (! $queueId || ! $userId) {
            throw new InvalidArgumentException('Missing queue_id or assignment_user_id when triggering assign_human transition.');
        }

        $assignedAt = $this->resolveTimestamp($context, 'assigned_at');

        DB::table('queue_items')
            ->where('queue_id', $queueId)
            ->where('conversation_id', $conversation->id)
            ->where('state', 'queued')
            ->update([
                'state' => 'hot',
                'dequeued_at' => $assignedAt,
                'updated_at' => $assignedAt,
            ]);

        DB::table('assignments')->insert([
            'conversation_id' => $conversation->id,
            'queue_id' => $queueId,
            'user_id' => $userId,
            'assigned_at' => $assignedAt,
            'accepted_at' => null,
            'released_at' => null,
            'resolved_at' => null,
            'status' => 'assigned',
            'metadata' => $this->encodeNullableArray($context, 'assignment_metadata'),
            'created_at' => $assignedAt,
            'updated_at' => $assignedAt,
        ]);

        $this->touchConversation($conversation, $event, $context);
        $this->recordAudit($conversation, $event, [
            'queue_id' => $queueId,
            'user_id' => $userId,
        ]);
    }

    public function afterHumanAccepts(TransitionEvent $event): void
    {
        $conversation = $this->refreshConversation($event);
        $context = $event->getContext();

        $userId = Arr::get($context, 'assignment_user_id');
        if (! $userId) {
            throw new InvalidArgumentException('Missing assignment_user_id when triggering human_accepts transition.');
        }

        $acceptedAt = $this->resolveTimestamp($context, 'accepted_at');

        $assignment = $this->latestAssignment($conversation->id, $userId);
        if (! $assignment) {
            throw new InvalidArgumentException('No assignment found to accept for the provided user.');
        }

        DB::table('assignments')
            ->where('id', $assignment->id)
            ->update([
                'status' => 'human_working',
                'accepted_at' => $acceptedAt,
                'updated_at' => $acceptedAt,
            ]);

        $this->touchConversation($conversation, $event, $context);
        $this->recordAudit($conversation, $event, [
            'user_id' => $userId,
        ]);

        RunAgentForConversation::dispatch($conversation->id);
    }

    public function afterReturnToAgent(TransitionEvent $event): void
    {
        $conversation = $this->refreshConversation($event);
        $context = $event->getContext();

        $userId = Arr::get($context, 'assignment_user_id');
        if (! $userId) {
            throw new InvalidArgumentException('Missing assignment_user_id when triggering return_to_agent transition.');
        }

        $releasedAt = $this->resolveTimestamp($context, 'released_at');

        $assignment = $this->latestAssignment($conversation->id, $userId);
        if (! $assignment) {
            throw new InvalidArgumentException('No assignment found to release for the provided user.');
        }

        DB::table('assignments')
            ->where('id', $assignment->id)
            ->update([
                'status' => 'released',
                'released_at' => $releasedAt,
                'updated_at' => $releasedAt,
            ]);

        $this->touchConversation($conversation, $event, $context);
        $this->recordAudit($conversation, $event, [
            'user_id' => $userId,
        ]);

        RunAgentForConversation::dispatch($conversation->id);
    }

    public function afterResolve(TransitionEvent $event): void
    {
        $conversation = $this->refreshConversation($event);
        $context = $event->getContext();

        $resolvedAt = $this->resolveTimestamp($context, 'resolved_at');
        $userId = Arr::get($context, 'assignment_user_id');

        $assignment = $this->latestAssignment($conversation->id, $userId);
        if ($assignment) {
            DB::table('assignments')
                ->where('id', $assignment->id)
                ->update([
                    'status' => 'resolved',
                    'resolved_at' => $resolvedAt,
                    'updated_at' => $resolvedAt,
                ]);
        }

        DB::table('queue_items')
            ->where('conversation_id', $conversation->id)
            ->whereIn('state', ['queued', 'hot'])
            ->update([
                'state' => 'completed',
                'updated_at' => $resolvedAt,
                'dequeued_at' => $resolvedAt,
            ]);

        $this->touchConversation($conversation, $event, $context, $resolvedAt);
        $this->recordAudit($conversation, $event, [
            'user_id' => $userId,
            'summary' => Arr::get($context, 'resolution_summary'),
        ]);
    }

    public function afterArchive(TransitionEvent $event): void
    {
        $conversation = $this->refreshConversation($event);
        $this->touchConversation($conversation, $event, $event->getContext());
        $this->recordAudit($conversation, $event);
    }

    protected function refreshConversation(TransitionEvent $event): Conversation
    {
        $object = $event->getStateMachine()->getObject();

        if (! $object instanceof Conversation) {
            throw new InvalidArgumentException('State machine subject must be a Conversation instance.');
        }
        return $object;
    }

    protected function touchConversation(Conversation $conversation, TransitionEvent $event, array $context, ?Carbon $timestamp = null): void
    {
        $time = $timestamp ?? $this->resolveTimestamp($context, 'occurred_at', false);
        if ($time) {
            $conversation->last_activity_at = $time;
            $conversation->updated_at = $time;
        } else {
            $conversation->updated_at = now();
        }

        $target = Arr::get($event->getConfig(), 'to');
        if ($target) {
            $conversation->status = $target;
        }

        $conversation->save();
    }

    protected function recordAudit(Conversation $conversation, TransitionEvent $event, array $payload = []): void
    {
        $context = $event->getContext();
        $actorId = Arr::get($context, 'actor_id');
        $now = now();

        DB::table('audit_events')->insert([
            'event_type' => 'conversation.' . $event->getTransition(),
            'conversation_id' => $conversation->id,
            'user_id' => $actorId,
            'subject_type' => Conversation::class,
            'subject_id' => $conversation->id,
            'payload' => json_encode(array_merge([
                'from' => $event->getState(),
                'to' => Arr::get($event->getConfig(), 'to'),
            ], array_filter($payload, fn ($value) => $value !== null))),
            'channel' => Arr::get($context, 'channel', 'system'),
            'occurred_at' => $this->resolveTimestamp($context, 'occurred_at', false) ?? $now,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    protected function latestAssignment(int $conversationId, ?int $userId = null): ?object
    {
        $query = DB::table('assignments')
            ->where('conversation_id', $conversationId)
            ->orderByDesc('assigned_at');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->first();
    }

    protected function encodeNullableArray(array $context, string $key): ?string
    {
        $value = Arr::get($context, $key);

        return is_null($value) ? null : json_encode($value);
    }

    protected function resolveTimestamp(array $context, string $key, bool $fallbackNow = true): ?Carbon
    {
        $value = Arr::get($context, $key);

        if ($value instanceof Carbon) {
            return $value;
        }

        if (is_string($value)) {
            return Carbon::parse($value);
        }

        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value);
        }

        return $fallbackNow ? now() : null;
    }
}
