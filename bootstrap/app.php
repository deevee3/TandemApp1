<?php

use App\Http\Middleware\AuthenticateApiKey;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureUserIsSubscribed;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Providers\DatabaseServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withProviders([
        DatabaseServiceProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.apikey' => AuthenticateApiKey::class,
            'permission' => EnsurePermission::class,
            'subscribed' => EnsureUserIsSubscribed::class,
        ]);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state', 'selected_plan']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
