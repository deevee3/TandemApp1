<?php

namespace App\Providers;

use App\Services\ConversationLifecycleService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class DatabaseServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ConversationLifecycleService::class);
    }

    public function boot(): void
    {
        try {
            $connection = DB::connection();
            if ($connection->getDriverName() !== 'sqlite') {
                return;
            }

            // Ensure the underlying PDO is established before issuing PRAGMA statements.
            $connection->getPdo();

            $connection->statement('PRAGMA journal_mode = WAL;');
            $connection->statement('PRAGMA synchronous = NORMAL;');
            $connection->statement('PRAGMA busy_timeout = 5000;');
        } catch (\Throwable $exception) {
            Log::warning('Failed to configure SQLite WAL settings', [
                'exception' => $exception->getMessage(),
            ]);
        }
    }
}
