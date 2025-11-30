<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KbArticle>
 */
class KbArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'content' => $this->faker->paragraphs(3, true),
            'status' => 'published',
            'tags' => $this->faker->words(3),
            'embedding' => array_fill(0, 1536, 0.001), // Mock 1536-dim vector
            'author_id' => \App\Models\User::factory(),
            'published_at' => now(),
        ];
    }
}
