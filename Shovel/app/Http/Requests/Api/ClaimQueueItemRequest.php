<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ClaimQueueItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'actor_id' => ['required', 'integer', 'exists:users,id'],
            'assignment_user_id' => ['required', 'integer', 'exists:users,id'],
            'assignment_metadata' => ['nullable', 'array'],
        ];
    }

    public function actorId(): int
    {
        return (int) $this->validated('actor_id');
    }

    public function assignmentUserId(): int
    {
        return (int) $this->validated('assignment_user_id');
    }

    public function assignmentMetadata(): ?array
    {
        /** @var array|null $metadata */
        $metadata = $this->validated('assignment_metadata');

        return $metadata;
    }
}
