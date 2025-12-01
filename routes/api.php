<?php

use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\BotActiveConversationController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\ConversationHandoffController;
use App\Http\Controllers\Api\ConversationMessageController;
use App\Http\Controllers\Api\ConversationResolutionController;
use App\Http\Controllers\Api\QueueItemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth.apikey'])->group(function () {
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::post('/conversations/{conversation}/messages', [ConversationMessageController::class, 'store']);
    Route::post('/conversations/{conversation}/handoff', [ConversationHandoffController::class, 'store']);
    Route::post('/conversations/{conversation}/resolve', [ConversationResolutionController::class, 'store']);

    Route::get('/queues/{queue}/items', [QueueItemController::class, 'index']);
    Route::get('/conversations/bot-active', [BotActiveConversationController::class, 'index']);
    Route::post('/queues/{queue}/items/{queueItem}/claim', [QueueItemController::class, 'claim']);

    Route::post('/assignments/{assignment}/accept', [AssignmentController::class, 'accept']);
    Route::post('/assignments/{assignment}/release', [AssignmentController::class, 'release']);
    Route::post('/assignments/{assignment}/resolve', [AssignmentController::class, 'resolve']);
});

// Stripe webhook (must be outside auth middleware)
Route::post('/stripe/webhook', [\Laravel\Cashier\Http\Controllers\WebhookController::class, 'handleWebhook']);

// Routes requiring authenticated user (human agent)
// Use 'web' middleware group to enable session support for authentication
Route::middleware(['web', 'auth'])->group(function () {
    Route::post('/conversations/{conversation}/human-messages', [ConversationMessageController::class, 'storeHumanMessage']);
    Route::post('/conversations/{conversation}/reclaim', [AssignmentController::class, 'reclaim']);
});
