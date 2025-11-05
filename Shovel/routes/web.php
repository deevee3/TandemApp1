<?php

use App\Http\Controllers\AgentSession\AgentTokenController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\InboxController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

$authenticatedMiddleware = array_filter([
    'auth',
    app()->environment('local', 'testing') ? null : ValidateSessionWithWorkOS::class,
]);

Route::middleware($authenticatedMiddleware)->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('inbox', InboxController::class)->name('inbox');
    Route::get('conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');

    Route::post('agent-session/token', AgentTokenController::class)->name('agent-session.token');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/auth.php';
