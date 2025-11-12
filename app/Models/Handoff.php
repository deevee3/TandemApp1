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
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
