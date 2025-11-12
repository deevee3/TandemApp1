<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueItem extends Model
{
    use HasFactory;

    public const STATE_QUEUED = 'queued';
    public const STATE_HOT = 'hot';
    public const STATE_COMPLETED = 'completed';

    protected $guarded = [];

    protected $casts = [
        'enqueued_at' => 'datetime',
        'dequeued_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function queue(): BelongsTo
    {
        return $this->belongsTo(Queue::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
