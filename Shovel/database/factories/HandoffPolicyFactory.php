<?php

namespace Database\Factories;

use App\Models\HandoffPolicy;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<HandoffPolicy>
 */
class HandoffPolicyFactory extends Factory
{
    protected $model = HandoffPolicy::class;

    public function definition(): array
    {
        $reason = Str::slug($this->faker->unique()->words(2, true), '_');

        return [
            'name' => $this->faker->sentence(3),
            'reason_code' => $reason,
            'confidence_threshold' => $this->faker->randomFloat(4, 0.2, 0.95),
            'metadata' => [
                'description' => $this->faker->sentence(),
            ],
            'active' => true,
        ];
    }

    public function inactive(): self
    {
        return $this->state(fn () => [
            'active' => false,
        ]);
    }
}
