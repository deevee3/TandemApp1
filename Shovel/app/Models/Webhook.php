<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Webhook extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'events' => 'array',
        'active' => 'boolean',
        'metadata' => 'array',
    ];
}
