<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla `site_menu_items` consolidada — incluye `parent_id` (FK self),
 * `icon`, y `site_template_id` (que originalmente llegaron en dos
 * migrations ALTER posteriores).
 *
 * El orden de columnas respeta dónde terminaban después de cada ALTER:
 *   id, parent_id (FK self), label, href, icon, location,
 *   site_template_id (FK site_templates), sort, is_active, timestamps.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')
                ->nullable()
                ->after('id')
                ->constrained('site_menu_items')
                ->cascadeOnDelete();
            $table->string('label', 80);
            $table->string('href', 255);
            $table->string('icon', 60)->nullable()->after('href');
            $table->string('location', 30)->default('primary');
            $table->foreignId('site_template_id')
                ->nullable()
                ->after('location')
                ->constrained('site_templates')
                ->cascadeOnDelete();
            $table->integer('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['location', 'sort']);
            $table->index(['parent_id', 'sort']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_menu_items');
    }
};
