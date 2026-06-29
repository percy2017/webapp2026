<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla `site_templates` consolidada.
 *
 * Estado final incluye las columnas que se agregaron después del
 * create original (`icon` y luego un set de columnas de brand que
 * finalmente fueron removidas a favor del singleton `site_settings`).
 * El resultado: solo las columnas que el operador edita hoy, en una
 * sola migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('thumbnail_media_id')
                ->nullable()
                ->constrained('media')
                ->nullOnDelete();
            $table->string('icon', 60)->nullable()->after('thumbnail_media_id');
            $table->boolean('is_active')->default(false)->index();
            $table->json('sections')->nullable();
            $table->json('theme')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_templates');
    }
};
