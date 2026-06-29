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
            // Brand identity carried by the preset. On success the
            // controller writes these straight onto the SiteSetting
            // singleton so /admin/site-settings, /manifest.webmanifest
            // and the favicon pick up the preset's identity. Strings
            // only here — logos still flow through the Media library
            // by hand.
            'brand' => ['nullable', 'array'],
            'brand.site_name' => ['nullable', 'string', 'max:120'],
            'brand.site_tagline' => ['nullable', 'string', 'max:255'],
            'brand.pwa_short_name' => ['nullable', 'string', 'max:32'],
            'brand.pwa_description' => ['nullable', 'string', 'max:240'],
            'brand.pwa_theme_color' => ['nullable', 'string', 'max:9', 'regex:/^#[0-9a-fA-F]{3,8}$/'],
            'brand.pwa_background_color' => ['nullable', 'string', 'max:9', 'regex:/^#[0-9a-fA-F]{3,8}$/'],
            // Static SVG paths served from /public that the controller
            // imports into the Media library as the site's logo/favicon
            // for the active template. Must start with /blocks/ to keep
            // imports strictly inside the design-asset folder we control.
            'brand.logo_path' => ['nullable', 'string', 'max:200', 'regex:/^\/blocks\/[A-Za-z0-9._\-]+$/'],
            'brand.favicon_path' => ['nullable', 'string', 'max:200', 'regex:/^\/blocks\/[A-Za-z0-9._\-]+$/'],
            // SEO defaults — written to SiteSetting::default_seo on
            // create so /admin/site-settings opens with the preset's
            // tagline already in the SEO card.
            'brand.seo_title' => ['nullable', 'string', 'max:120'],
            'brand.seo_description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
