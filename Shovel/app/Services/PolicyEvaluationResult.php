<?php

namespace App\Services;

class PolicyEvaluationResult
{
    private bool $handoff;

    private ?string $reason;

    private ?float $confidence;

    /**
     * @var array<int, mixed>
     */
    private array $policyHits;

    /**
     * @var array<int, string>
     */
    private array $requiredSkills;

    /**
     * @var array<string, mixed>
     */
    private array $handoffMetadata;

    /**
     * @var array<string, mixed>
     */
    private array $queueMetadata;

    public function __construct(
        bool $handoff,
        ?string $reason,
        ?float $confidence,
        array $policyHits = [],
        array $requiredSkills = [],
        array $handoffMetadata = [],
        array $queueMetadata = []
    ) {
        $this->handoff = $handoff;
        $this->reason = $this->normalizeReason($handoff ? $reason : $reason);
        $this->confidence = $confidence;
        $this->policyHits = $policyHits;
        $this->requiredSkills = $requiredSkills;
        $this->handoffMetadata = $handoffMetadata;
        $this->queueMetadata = $queueMetadata;

        if ($this->handoff && $this->reason === null) {
            $this->reason = 'uncertain_intent';
        }
    }

    public function shouldHandoff(): bool
    {
        return $this->handoff;
    }

    public function reason(): ?string
    {
        return $this->reason;
    }

    public function confidence(): ?float
    {
        return $this->confidence;
    }

    /**
     * @return array<int, mixed>
     */
    public function policyHits(): array
    {
        return $this->policyHits;
    }

    /**
     * @return array<int, string>
     */
    public function requiredSkills(): array
    {
        return $this->requiredSkills;
    }

    /**
     * @return array<string, mixed>
     */
    public function handoffMetadata(): array
    {
        return $this->handoffMetadata;
    }

    /**
     * @return array<string, mixed>
     */
    public function queueMetadata(array $extra = []): array
    {
        return array_filter(array_merge($this->queueMetadata, $extra), static function ($value) {
            return $value !== null;
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function handoffContext(): array
    {
        $context = [
            'reason_code' => $this->reason,
            'confidence' => $this->confidence,
            'policy_hits' => $this->policyHits,
            'required_skills' => $this->requiredSkills,
        ];

        if (! empty($this->handoffMetadata)) {
            $context['handoff_metadata'] = $this->handoffMetadata;
        }

        return $context;
    }

    private function normalizeReason(?string $reason): ?string
    {
        if ($reason === null) {
            return null;
        }

        $trimmed = trim($reason);

        if ($trimmed === '') {
            return null;
        }

        return str_replace(' ', '_', strtolower($trimmed));
    }
}
