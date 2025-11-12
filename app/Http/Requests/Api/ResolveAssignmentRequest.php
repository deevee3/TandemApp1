<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ResolveAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'actor_id' => ['required', 'integer', 'exists:users,id'],
            'summary' => ['required', 'string'],
        ];
    }

    public function actorId(): int
    {
        return (int) $this->validated('actor_id');
    }

    public function summary(): string
    {
        return (string) $this->validated('summary');
    }
}
