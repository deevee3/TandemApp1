<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ResolveConversationRequest;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use SM\Factory\FactoryInterface;

class ConversationResolutionController extends Controller
{
    public function __construct(private readonly FactoryInterface $stateMachineFactory)
    {
    }

    public function store(ResolveConversationRequest $request, Conversation $conversation): JsonResponse
    {
        $conversation = DB::transaction(function () use ($conversation, $request) {
            /** @var Conversation $conversation */
            $conversation = Conversation::query()->lockForUpdate()->findOrFail($conversation->id);

            $stateMachine = $this->stateMachineFactory->get($conversation, 'conversation');
            if (! $stateMachine->can('resolve')) {
                abort(409, 'Conversation cannot be resolved in its current state.');
            }

            $context = $request->resolutionContext();

            $stateMachine->apply('resolve', false, $context);

            if ($stateMachine->can('archive')) {
                $stateMachine->apply('archive', false, $context);
            }

            return $conversation->fresh();
        });

        return response()->json([
            'data' => $conversation->toArray(),
        ]);
    }
}
