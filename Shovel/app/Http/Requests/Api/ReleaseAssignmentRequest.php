<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ReleaseAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'actor_id' => ['required', 'integer', 'exists:users,id'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function actorId(): int
    {
        return (int) $this->validated('actor_id');
    }

    public function reason(): ?string
    {
        /** @var string|null $reason */
        $reason = $this->validated('reason');

        return $reason;
    }
}
