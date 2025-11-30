<?php

use App\Http\Controllers\AgentSession\AgentTokenController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\InboxController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/how-it-works', function () {
    return Inertia::render('how-it-works');
})->name('how-it-works');

Route::get('/pricing', function () {
    return Inertia::render('pricing');
})->name('pricing');

Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

// Public chat routes (no authentication required)
Route::prefix('chat')->name('chat.')->group(function () {
    Route::get('{token}', [ChatController::class, 'show'])->name('show');
    Route::get('{token}/messages', [ChatController::class, 'messages'])->name('messages');
    Route::post('{token}/messages', [ChatController::class, 'sendMessage'])
        ->middleware('throttle:10,1') // 10 messages per minute
        ->name('send');
});

$authenticatedMiddleware = array_filter([
    'auth',
    app()->environment('local', 'testing') ? null : ValidateSessionWithWorkOS::class,
]);

Route::middleware($authenticatedMiddleware)->group(function () {
    Route::get('dashboard', \App\Http\Controllers\DashboardController::class)->name('dashboard');

    Route::get('inbox', InboxController::class)->name('inbox');
    Route::get('conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');

    Route::post('agent-session/token', AgentTokenController::class)->name('agent-session.token');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/auth.php';
