<?php

namespace App\Http\Requests\AgentSession;

use Illuminate\Foundation\Http\FormRequest;

class IssueAgentTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'scopes' => ['nullable', 'array'],
            'scopes.*' => ['string', 'max:128'],
        ];
    }

    public function scopes(): ?array
    {
        /** @var array<string>|null $scopes */
        $scopes = $this->validated('scopes');

        return $scopes;
    }
}
