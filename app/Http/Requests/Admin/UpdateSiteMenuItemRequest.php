<?php

namespace App\Http\Requests\Admin;

use App\Models\SiteMenuItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSiteMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage-settings');
    }

    public function rules(): array
    {
        $itemId = $this->route('siteMenuItem')?->id
            ?? $this->route('site_menu_item')?->id;

        return [
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('site_menu_items', 'id'),
                Rule::notIn([$itemId]),
            ],
            'label' => ['required', 'string', 'max:80'],
            'href' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:60'],
            'location' => [
                'nullable',
                'string',
                Rule::in([SiteMenuItem::LOCATION_PRIMARY]),
            ],
            'sort' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('parent_id') && $this->input('parent_id') === '') {
            $this->merge(['parent_id' => null]);
        }
    }
}
