<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla `chat_widget_settings` consolidada — el estado final NO
 * incluye las columnas `welcome_message` ni `offline_message`, que
 * fueron dropeadas por una migration ALTER posterior. Las omite desde
 * el create.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_widget_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(true);
            $table->string('position')->default('bottom-right');
            $table->string('primary_color', 20)->default('#3b82f6');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_widget_settings');
    }
};
