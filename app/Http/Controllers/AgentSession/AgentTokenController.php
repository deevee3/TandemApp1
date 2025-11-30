<?php

namespace App\Http\Controllers\AgentSession;

use App\Http\Controllers\Controller;
use App\Http\Requests\AgentSession\IssueAgentTokenRequest;
use App\Models\ApiKey;
use App\Models\Conversation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AgentTokenController extends Controller
{
    public function __invoke(IssueAgentTokenRequest $request): JsonResponse
    {
        $user = $request->user();

        abort_unless($user, 401);

        $defaultScopes = Arr::wrap(config('auth.agent_tokens.default_scopes', []));
        $requestedScopes = Arr::wrap($request->scopes());
        $scopes = array_values(array_unique(count($requestedScopes) > 0 ? $requestedScopes : $defaultScopes));

        if (count($scopes) === 0) {
            $scopes = $defaultScopes;
        }

        $ttlMinutes = (int) max(config('auth.agent_tokens.ttl_minutes', 60), 1);
        $issuedAt = Carbon::now()->startOfSecond();
        $expiresAt = (clone $issuedAt)->addMinutes($ttlMinutes);

        $plainToken = 'agent_' . Str::random(48);
        $hashed = hash('sha256', $plainToken);

        // Create a test conversation for this session
        $conversation = Conversation::create([
            'subject' => 'Agent Test Session - ' . $issuedAt->format('M d, H:i'),
            'status' => Conversation::STATUS_NEW,
            'priority' => 'normal',
            'requester_type' => 'user',
            'requester_identifier' => $user->email,
            'metadata' => [
                'source' => 'agent_test_session',
                'user_id' => $user->id,
            ],
        ]);

        $apiKey = DB::transaction(function () use ($user, $scopes, $hashed, $expiresAt, $issuedAt, $conversation) {
            ApiKey::query()
                ->where('user_id', $user->id)
                ->where('active', true)
                ->where('metadata->channel', 'agent_handshake')
                ->update([
                    'active' => false,
                    'updated_at' => Carbon::now(),
                ]);

            return ApiKey::create([
                'name' => $user->name ? $user->name . ' Agent Token' : 'Agent Token',
                'key' => $hashed,
                'user_id' => $user->id,
                'scopes' => $scopes,
                'active' => true,
                'expires_at' => $expiresAt,
                'metadata' => [
                    'channel' => 'agent_handshake',
                    'issued_at' => $issuedAt->toIso8601String(),
                    'test_conversation_id' => $conversation->id,
                    'chat_url' => $conversation->chat_url,
                ],
            ]);
        });

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $plainToken,
            'issued_at' => $issuedAt->toIso8601String(),
            'expires_at' => optional($apiKey->expires_at)->toIso8601String(),
            'expires_in' => $issuedAt->diffInSeconds($expiresAt),
            'scopes' => $scopes,
            'chat_url' => $conversation->chat_url,
        ], 201);
    }
}
