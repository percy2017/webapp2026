<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SendChatMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'content' => ['nullable', 'string', 'max:5000', 'required_without_all:attachments,media_ids'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:10240'],
            // Existing media IDs from the Media library (chosen via the
            // MediaAttachmentsPicker). Copied onto the message's
            // `attachments` collection by the controller.
            'media_ids' => ['nullable', 'array', 'max:5'],
            'media_ids.*' => ['integer', 'exists:media,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required_without_all' => 'Escribí un mensaje o adjuntá un archivo.',
        ];
    }
}
