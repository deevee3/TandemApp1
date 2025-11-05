<?php

namespace App\Http\Requests\Api;

use App\Models\QueueItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListQueueItemsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'state' => ['nullable', 'string', Rule::in([
                QueueItem::STATE_QUEUED,
                QueueItem::STATE_HOT,
                QueueItem::STATE_COMPLETED,
            ])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
