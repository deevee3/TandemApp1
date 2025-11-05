<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use Inertia\Inertia;

abstract class Controller
{
    protected function shareAgentTokenMeta(?int $userId): void
    {
        if (! $userId) {
            Inertia::share('agentToken', null);

            return;
        }

        /** @var ApiKey|null $token */
        $token = ApiKey::query()
            ->where('user_id', $userId)
            ->where('active', true)
            ->where('metadata->channel', 'agent_handshake')
            ->orderByDesc('created_at')
            ->first(['expires_at', 'created_at']);

        if (! $token) {
            Inertia::share('agentToken', null);

            return;
        }

        Inertia::share('agentToken', [
            'expires_at' => optional($token->expires_at)->toIso8601String(),
            'issued_at' => optional($token->created_at)->toIso8601String(),
        ]);
    }
}
