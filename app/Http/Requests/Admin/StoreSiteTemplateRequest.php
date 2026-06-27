<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSiteTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage-templates');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required', 'string', 'max:60',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('site_templates', 'slug'),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'thumbnail_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'icon' => ['nullable', 'string', 'max:60'],
            'is_active' => ['boolean'],
            'sections' => ['nullable', 'array'],
            'blocks' => ['nullable', 'array'],
            'menu_items' => ['nullable', 'array'],
            'menu_items.*.label' => ['required_with:menu_items', 'string', 'max:60'],
            'menu_items.*.href' => ['required_with:menu_items', 'string', 'max:500'],
            'menu_items.*.icon' => ['nullable', 'string', 'max:60'],
            'menu_items.*.children' => ['nullable', 'array'],
            'theme' => ['nullable', 'array'],
            'theme.primary_color' => ['nullable', 'string', 'max:20'],
            'theme.accent_color' => ['nullable', 'string', 'max:20'],
            'theme.radius' => ['nullable', 'string', 'max:20'],
        ];
    }
}
