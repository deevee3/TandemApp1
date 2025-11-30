<?php

namespace App\Jobs;

use App\Models\KbArticle;
use App\Services\KnowledgeService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateArticleEmbedding implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public KbArticle $article
    ) {}

    /**
     * Execute the job.
     */
    public function handle(KnowledgeService $knowledgeService): void
    {
        $text = "{$this->article->title}\n\n{$this->article->content}";
        
        // Append tags if available
        if (! empty($this->article->tags)) {
            $text .= "\n\nTags: " . implode(', ', $this->article->tags);
        }

        $embedding = $knowledgeService->generateEmbedding($text);

        if (! empty($embedding)) {
            $this->article->embedding = $embedding;
            $this->article->saveQuietly(); // Avoid triggering observers/events if any
        }
    }
}
