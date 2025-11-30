<?php

namespace App\Jobs;

use App\Models\Webhook;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DispatchWebhook implements ShouldQueue
{
    use Queueable;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Backoff times in seconds between retries.
     *
     * @var array<int>
     */
    public array $backoff = [10, 60, 300];

    public function __construct(
        public Webhook $webhook,
        public string $eventType,
        public array $payload
    ) {
    }

    public function handle(): void
    {
        $url = $this->webhook->url;
        
        if (empty($url)) {
            Log::warning("Webhook {$this->webhook->id} has no URL configured");
            return;
        }

        $headers = [
            'Content-Type' => 'application/json',
            'X-Webhook-Event' => $this->eventType,
            'X-Webhook-Timestamp' => now()->timestamp,
        ];

        // Add signature if secret is configured
        $secret = $this->getWebhookSecret();
        if ($secret) {
            $signature = hash_hmac('sha256', json_encode($this->payload), $secret);
            $headers['X-Webhook-Signature'] = $signature;
        }

        try {
            $response = Http::timeout(30)
                ->withHeaders($headers)
                ->post($url, $this->payload);

            if ($response->successful()) {
                Log::info("Webhook dispatched successfully", [
                    'webhook_id' => $this->webhook->id,
                    'event' => $this->eventType,
                    'url' => $url,
                    'status' => $response->status(),
                ]);
            } else {
                Log::warning("Webhook returned non-success status", [
                    'webhook_id' => $this->webhook->id,
                    'event' => $this->eventType,
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                // Fail the job to trigger retry
                $this->fail(new \Exception("Webhook returned status {$response->status()}"));
            }
        } catch (\Exception $e) {
            Log::error("Webhook dispatch failed", [
                'webhook_id' => $this->webhook->id,
                'event' => $this->eventType,
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function getWebhookSecret(): ?string
    {
        $encrypted = $this->webhook->secret;
        
        if (empty($encrypted)) {
            return null;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (\Exception) {
            return null;
        }
    }
}
