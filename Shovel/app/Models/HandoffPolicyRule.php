<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HandoffPolicyRule extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'criteria' => 'array',
        'active' => 'boolean',
    ];

    public function policy(): BelongsTo
    {
        return $this->belongsTo(HandoffPolicy::class, 'handoff_policy_id');
    }
}
