<?php

namespace Database\Factories;

use App\Models\Queue;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Queue>
 */
class QueueFactory extends Factory
{
    protected $model = Queue::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::random(6),
            'description' => $this->faker->sentence(),
            'is_default' => false,
            'sla_first_response_minutes' => 15,
            'sla_resolution_minutes' => 120,
            'skills_required' => [],
            'priority_policy' => ['high_threshold_minutes' => 60],
        ];
    }
}
