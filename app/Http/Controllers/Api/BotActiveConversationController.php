<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QueueItemResource;
use App\Models\Conversation;
use App\Models\QueueItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BotActiveConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 25);

        $conversations = Conversation::query()
            ->where('status', Conversation::STATUS_AGENT_WORKING)
            ->with([
                'messages' => function ($query) {
                    $query->latest()->limit(1);
                },
                'currentAssignment',
            ])
            ->orderByDesc('last_activity_at')
            ->paginate($perPage);

        // Map conversations to a structure compatible with QueueItemResource
        $items = $conversations->getCollection()->map(function (Conversation $conversation) {
            // Create a virtual QueueItem for the resource
            $virtualItem = new QueueItem([
                'id' => 0, // Virtual ID
                'queue_id' => 0, // Virtual Queue ID
                'state' => 'bot_active',
                'enqueued_at' => $conversation->created_at,
                'metadata' => [],
            ]);
            
            // Manually set the relation to avoid database query
            $virtualItem->setRelation('conversation', $conversation);
            
            return $virtualItem;
        });

        $conversations->setCollection($items);

        return QueueItemResource::collection($conversations)
            ->additional([
                'meta' => [
                    'pagination' => [
                        'current_page' => $conversations->currentPage(),
                        'per_page' => $conversations->perPage(),
                        'total' => $conversations->total(),
                        'last_page' => $conversations->lastPage(),
                    ],
                    'filters' => [
                        'state' => 'bot_active',
                    ],
                ],
            ])
            ->response()
            ->setStatusCode(200);
    }
}
