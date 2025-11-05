<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiKey extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'scopes' => 'array',
        'active' => 'boolean',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * API keys issued via the agent handshake belong to a user for auditing.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
