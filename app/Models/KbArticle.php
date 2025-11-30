<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class KbArticle extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'title',
        'content',
        'status',
        'embedding',
        'tags',
        'author_id',
        'published_at',
    ];

    protected $casts = [
        'embedding' => 'array',
        'tags' => 'array',
        'published_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    protected static function booted()
    {
        static::saved(function (KbArticle $article) {
            // Only generate if relevant fields changed and it wasn't a quiet save
            if ($article->wasChanged(['title', 'content', 'tags'])) {
                \App\Jobs\GenerateArticleEmbedding::dispatch($article);
            }
        });
    }
}
