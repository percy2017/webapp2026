<?php

namespace App\Http\Requests\Admin;

use App\Models\SiteMenuItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSiteMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage-settings');
    }

    public function rules(): array
    {
        return [
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('site_menu_items', 'id'),
            ],
            'label' => ['required', 'string', 'max:80'],
            'href' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:60'],
            'location' => [
                'required',
                'string',
                Rule::in([SiteMenuItem::LOCATION_PRIMARY]),
            ],
            'sort' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('location') || $this->input('location') === null) {
            $this->merge(['location' => SiteMenuItem::LOCATION_PRIMARY]);
        }

        if (! $this->has('parent_id') || $this->input('parent_id') === '') {
            $this->merge(['parent_id' => null]);
        }

        if (! $this->has('sort') || $this->input('sort') === null) {
            $max = SiteMenuItem::query()
                ->where('location', $this->input('location'))
                ->where('parent_id', $this->input('parent_id'))
                ->max('sort');
            $this->merge(['sort' => ($max ?? -1) + 1]);
        }
    }
}
