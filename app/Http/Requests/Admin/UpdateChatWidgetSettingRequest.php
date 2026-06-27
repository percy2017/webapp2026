<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChatWidgetSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'enabled' => ['boolean'],
            'position' => [
                'required',
                Rule::in([
                    'bottom-right',
                    'bottom-left',
                    'top-right',
                    'top-left',
                ]),
            ],
        ];
    }
}
