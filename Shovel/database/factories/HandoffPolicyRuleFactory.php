<?php

namespace Database\Factories;

use App\Models\HandoffPolicy;
use App\Models\HandoffPolicyRule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HandoffPolicyRule>
 */
class HandoffPolicyRuleFactory extends Factory
{
    protected $model = HandoffPolicyRule::class;

    public function definition(): array
    {
        $trigger = $this->faker->randomElement([
            'confidence_below_threshold',
            'policy_flag_detected',
            'tool_error',
        ]);

        return [
            'handoff_policy_id' => HandoffPolicy::factory(),
            'trigger_type' => $trigger,
            'criteria' => $this->criteriaForTrigger($trigger),
            'priority' => $this->faker->numberBetween(1, 100),
            'active' => true,
        ];
    }

    public function inactive(): self
    {
        return $this->state(fn () => [
            'active' => false,
        ]);
    }

    protected function criteriaForTrigger(string $trigger): array
    {
        return match ($trigger) {
            'confidence_below_threshold' => [
                'threshold' => $this->faker->randomFloat(2, 0.1, 0.7),
            ],
            'policy_flag_detected' => [
                'flags' => $this->faker->randomElements(['pii', 'legal', 'escalation'], $this->faker->numberBetween(1, 2)),
            ],
            'tool_error' => [
                'retryable' => $this->faker->boolean(),
            ],
            default => [],
        };
    }
}
