<?php

namespace Database\Seeders;

use App\Models\KbArticle;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KbArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first() ?? User::first();

        $articles = [
            [
                'title' => 'Refund Policy',
                'content' => "We offer a full refund within 30 days of purchase. \n\nIf you are not satisfied with the product, please contact support with your order number.",
                'tags' => ['billing', 'refunds'],
            ],
            [
                'title' => 'Resetting Your Password',
                'content' => "1. Go to the login page.\n2. Click 'Forgot Password'.\n3. Enter your email address.\n4. Follow the link sent to your email.",
                'tags' => ['account', 'security'],
            ],
            [
                'title' => 'Contacting Support',
                'content' => "Our support team is available 24/7. You can email us at support@example.com or use the chat widget in the bottom right corner.",
                'tags' => ['support', 'contact'],
            ],
        ];

        foreach ($articles as $data) {
            KbArticle::create(array_merge($data, [
                'status' => KbArticle::STATUS_PUBLISHED,
                'author_id' => $admin?->id,
                'published_at' => now(),
                // Mock embedding
                'embedding' => array_fill(0, 1536, 0.001),
            ]));
        }
    }
}
