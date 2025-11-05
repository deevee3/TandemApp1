<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AppendRequesterMessageRequest;
use App\Jobs\RunAgentForConversation;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use SM\Factory\FactoryInterface;

class ConversationMessageController extends Controller
{
    public function __construct(private readonly FactoryInterface $stateMachineFactory)
    {
    }

    public function store(AppendRequesterMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $conversation = DB::transaction(function () use ($conversation, $request) {
            $conversation->refresh();

            $conversation->messages()->create($request->messageAttributes());
            return $conversation;
        });

        $conversation = $conversation->fresh(['messages']);

        $this->ensureAgentWorking($conversation);

        return response()->json([
            'data' => $conversation->toArray(),
        ], 201);
    }

    protected function ensureAgentWorking(Conversation $conversation): void
    {
        $stateMachine = $this->stateMachineFactory->get($conversation, 'conversation');

        if ($stateMachine->can('agent_begins')) {
            $stateMachine->apply('agent_begins', false, [
                'channel' => 'api',
                'occurred_at' => now(),
            ]);

            RunAgentForConversation::dispatch($conversation->id);
        }
    }
}
