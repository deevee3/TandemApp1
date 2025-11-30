<?php

namespace App\Services;

use App\Models\KbArticle;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class KnowledgeService
{
    public function __construct(
        protected OpenAIClient $client
    ) {}

    /**
     * Generate an embedding vector for the given text.
     *
     * @param string $text
     * @return array<float>
     */
    public function generateEmbedding(string $text): array
    {
        // Sanitize input
        $text = str_replace("\n", " ", $text);

        try {
            $response = $this->client->embeddings([
                'model' => 'text-embedding-3-small',
                'input' => $text,
            ]);

            return $response['data'][0]['embedding'] ?? [];
        } catch (\Exception $e) {
            Log::error('Failed to generate embedding', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Search the knowledge base for articles matching the query.
     *
     * @param string $query
     * @param int $limit
     * @param float $threshold
     * @return Collection<KbArticle>
     */
    public function search(string $query, int $limit = 3, float $threshold = 0.5): Collection
    {
        $queryEmbedding = $this->generateEmbedding($query);

        if (empty($queryEmbedding)) {
            return collect();
        }

        // For MVP: Load all published articles into memory.
        // Optimization: Cache this collection if it gets large.
        $articles = KbArticle::published()
            ->whereNotNull('embedding')
            ->get();

        // Calculate similarity scores
        $scored = $articles->map(function (KbArticle $article) use ($queryEmbedding) {
            $score = $this->cosineSimilarity($queryEmbedding, $article->embedding);
            $article->setAttribute('similarity_score', $score);
            return $article;
        });

        // Filter and sort
        return $scored
            ->filter(fn ($article) => $article->similarity_score >= $threshold)
            ->sortByDesc('similarity_score')
            ->take($limit)
            ->values();
    }

    /**
     * Calculate cosine similarity between two vectors.
     * OpenAI embeddings are normalized, so this is just the dot product.
     */
    protected function cosineSimilarity(array $vecA, array $vecB): float
    {
        if (count($vecA) !== count($vecB)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        foreach ($vecA as $i => $valA) {
            $dotProduct += $valA * $vecB[$i];
        }

        return $dotProduct;
    }
}
