<?php

namespace App\Http\Requests\Api;

use App\Models\Message;
use Illuminate\Foundation\Http\FormRequest;

class AppendRequesterMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function messageAttributes(): array
    {
        return [
            'sender_type' => Message::SENDER_REQUESTER,
            'content' => $this->validated('content'),
            'metadata' => $this->validated('metadata'),
        ];
    }
}
