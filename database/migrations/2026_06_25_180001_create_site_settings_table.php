<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla `site_settings` consolidada — incluye todas las columnas que
 * llegaron en migrations ALTER (`pwa_*` y `*_url`).
 *
 * El sistema trata esta tabla como singleton (id=1) vía
 * `SiteSetting::instance()`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('HostBol');
            $table->string('site_tagline')->nullable();
            $table->foreignId('logo_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('logo_url', 500)->nullable()->after('logo_media_id');
            $table->foreignId('favicon_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('favicon_url', 500)->nullable()->after('favicon_media_id');
            $table->string('active_template_slug')->nullable();
            // PWA metadata promoted from the active template (or set
            // directly on /admin/site-settings).
            $table->string('pwa_short_name', 32)->nullable()->after('favicon_url');
            $table->string('pwa_description', 240)->nullable()->after('pwa_short_name');
            $table->string('pwa_theme_color', 9)->nullable()->after('pwa_description');
            $table->string('pwa_background_color', 9)->nullable()->after('pwa_theme_color');
            $table->json('default_seo')->nullable();
            $table->json('contact_info')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
