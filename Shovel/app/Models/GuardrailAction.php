<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuardrailAction extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'previous_config' => 'array',
        'applied_config' => 'array',
        'metrics_snapshot' => 'array',
        'applied_at' => 'datetime',
    ];
}
