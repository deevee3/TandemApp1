<?php

namespace App\Http\Controllers;

use App\Models\Queue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboxController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $this->shareAgentTokenMeta($request->user()?->id);

        $queues = Queue::query()
            ->select(['id', 'name', 'is_default'])
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();

        $defaultQueueId = $queues->firstWhere('is_default', true)?->id ?? $queues->first()?->id;

        $prefilledApiKey = app()->environment('local') ? env('SEED_API_KEY') : null;

        return Inertia::render('inbox', [
            'queues' => $queues,
            'defaultQueueId' => $defaultQueueId,
            'apiKey' => $prefilledApiKey,
        ]);
    }
}
