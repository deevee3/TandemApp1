<?php

namespace App\Services;

class AgentRunResult
{
    private const STATUS_SUCCESS = 'success';
    private const STATUS_FALLBACK = 'fallback';
    private const STATUS_FAILURE = 'failure';

    public function __construct(
        private readonly string $status,
        private readonly ?array $payload = null,
        private readonly ?string $error = null,
    ) {
    }

    public static function success(array $payload): self
    {
        return new self(self::STATUS_SUCCESS, $payload);
    }

    public static function fallback(string $error): self
    {
        return new self(self::STATUS_FALLBACK, null, $error);
    }

    public static function failure(string $error): self
    {
        return new self(self::STATUS_FAILURE, null, $error);
    }

    public function isSuccess(): bool
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    public function isFallback(): bool
    {
        return $this->status === self::STATUS_FALLBACK;
    }

    public function isFailure(): bool
    {
        return $this->status === self::STATUS_FAILURE;
    }

    public function payload(): array
    {
        return $this->payload ?? [];
    }

    public function error(): ?string
    {
        return $this->error;
    }
}
