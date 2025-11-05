<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ResolveConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'summary' => ['required', 'string'],
            'actor_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    public function resolutionContext(): array
    {
        return [
            'resolution_summary' => $this->validated('summary'),
            'actor_id' => $this->validated('actor_id'),
            'resolved_at' => now(),
            'channel' => 'api',
        ];
    }
}
