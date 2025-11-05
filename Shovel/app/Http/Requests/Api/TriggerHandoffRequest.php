<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;

class TriggerHandoffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason_code' => ['required', 'string', 'max:100'],
            'confidence' => ['nullable', 'numeric', 'between:0,1'],
            'policy_hits' => ['nullable', 'array'],
            'policy_hits.*' => ['string'],
            'required_skills' => ['nullable', 'array'],
            'required_skills.*' => ['string'],
            'queue_id' => ['required', 'integer', 'exists:queues,id'],
            'handoff_metadata' => ['nullable', 'array'],
            'queue_item_metadata' => ['nullable', 'array'],
        ];
    }

    public function reasonCode(): string
    {
        return Arr::get($this->validated(), 'reason_code');
    }

    public function queueId(): int
    {
        return (int) Arr::get($this->validated(), 'queue_id');
    }

    public function handoffContext(): array
    {
        $data = $this->validated();

        return [
            'reason_code' => Arr::get($data, 'reason_code'),
            'confidence' => Arr::get($data, 'confidence'),
            'policy_hits' => Arr::get($data, 'policy_hits'),
            'required_skills' => Arr::get($data, 'required_skills'),
            'handoff_metadata' => Arr::get($data, 'handoff_metadata'),
            'handoff_at' => now(),
            'channel' => 'api',
        ];
    }

    public function enqueueContext(int $queueId): array
    {
        $data = $this->validated();

        return [
            'queue_id' => $queueId,
            'queue_item_metadata' => Arr::get($data, 'queue_item_metadata'),
            'enqueued_at' => now(),
            'channel' => 'api',
        ];
    }
}
