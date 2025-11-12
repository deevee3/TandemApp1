<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateConversationRequest;
use App\Jobs\RunAgentForConversation;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use SM\Factory\FactoryInterface;

class ConversationController extends Controller
{
    public function __construct(private readonly FactoryInterface $stateMachineFactory)
    {
    }

    public function store(CreateConversationRequest $request): JsonResponse
    {
        $conversation = DB::transaction(function () use ($request) {
            $conversation = Conversation::create($request->conversationAttributes());

            if ($initialMessage = $request->initialMessageAttributes()) {
                $conversation->messages()->create($initialMessage);
            }

            return $conversation;
        });

        $this->touchAgent($conversation);

        return response()->json([
            'data' => $conversation->fresh(['messages'])->toArray(),
        ], 201);
    }

    protected function touchAgent(Conversation $conversation): void
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
