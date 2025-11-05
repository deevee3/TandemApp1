<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TriggerHandoffRequest;
use App\Models\Conversation;
use App\Models\Queue;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use SM\Factory\FactoryInterface;

class ConversationHandoffController extends Controller
{
    public function __construct(private readonly FactoryInterface $stateMachineFactory)
    {
    }

    public function store(TriggerHandoffRequest $request, Conversation $conversation): JsonResponse
    {
        $conversation = DB::transaction(function () use ($conversation, $request) {
            /** @var Conversation $conversation */
            $conversation = Conversation::query()->lockForUpdate()->findOrFail($conversation->id);
            $queue = Queue::query()->findOrFail($request->queueId());

            $stateMachine = $this->stateMachineFactory->get($conversation, 'conversation');

            if (! $stateMachine->can('handoff_required')) {
                abort(409, 'Conversation is not in a state that allows handoff.');
            }

            $stateMachine->apply('handoff_required', false, $request->handoffContext());

            $conversation->refresh();
            $stateMachine = $this->stateMachineFactory->get($conversation, 'conversation');

            if (! $stateMachine->can('enqueue_for_human')) {
                abort(409, 'Conversation cannot be enqueued for a human at this time.');
            }

            $stateMachine->apply('enqueue_for_human', false, $request->enqueueContext($queue->id));

            return $conversation->fresh(['queueItems', 'handoffs']);
        });

        return response()->json([
            'data' => $conversation->toArray(),
        ]);
    }
}
