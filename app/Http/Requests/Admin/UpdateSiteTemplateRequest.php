<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSiteTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage-templates');
    }

    public function rules(): array
    {
        $templateId = $this->route('siteTemplate')?->id
            ?? $this->route('site_template')?->id;

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required', 'string', 'max:60',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('site_templates', 'slug')->ignore($templateId),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'thumbnail_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'icon' => ['nullable', 'string', 'max:60'],
            'sections' => ['nullable', 'array'],
            'sections.*.id' => ['required', 'string', 'max:60'],
            'sections.*.visible' => ['boolean'],
            'sections.*.content' => ['nullable', 'array'],
            'blocks' => ['nullable', 'array'],
            'blocks.*.id' => ['nullable', 'integer'],
            'blocks.*.type' => ['required', 'string', 'max:60'],
            'blocks.*.visible' => ['boolean'],
            'blocks.*.content' => ['nullable', 'array'],
            'theme' => ['nullable', 'array'],
            'theme.primary_color' => ['nullable', 'string', 'max:20'],
            'theme.accent_color' => ['nullable', 'string', 'max:20'],
            'theme.radius' => ['nullable', 'string', 'max:20'],
        ];
    }
}
