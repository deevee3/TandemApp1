<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Handoff extends Model
{
    use HasFactory;

    /**
     * The model does not manage timestamps. The database column uses CURRENT_TIMESTAMP defaults.
     */
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'confidence' => 'float',
        'policy_hits' => 'array',
        'required_skills' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get a human-readable direction label.
     */
    public function getDirectionLabelAttribute(): string
    {
        return match ($this->direction) {
            'agent_to_human' => 'Agent → Human',
            'human_to_agent' => 'Human → Agent',
            default => $this->direction,
        };
    }
}
