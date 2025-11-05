<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HandoffPolicy extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'confidence_threshold' => 'decimal:4',
        'required_skills' => 'array',
        'metadata' => 'array',
        'active' => 'boolean',
    ];

    /**
     * @return HasMany<HandoffPolicyRule>
     */
    public function rules(): HasMany
    {
        return $this->hasMany(HandoffPolicyRule::class)->orderByDesc('priority');
    }

    /**
     * @return BelongsToMany<Skill>
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'handoff_policy_skills');
    }

    public function isActive(): bool
    {
        return (bool) $this->active;
    }
}
