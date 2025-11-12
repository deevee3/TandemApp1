<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class AcceptAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'actor_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }

    public function actorId(): int
    {
        return (int) $this->validated('actor_id');
    }
}
