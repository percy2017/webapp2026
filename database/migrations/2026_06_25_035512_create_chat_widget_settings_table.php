<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_widget_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(true);
            $table->string('position')->default('bottom-right');
            $table->string('primary_color', 20)->default('#3b82f6');
            $table->string('welcome_message')->default('¡Hola! ¿En qué podemos ayudarte?');
            $table->string('offline_message')->default('Estamos fuera de horario. Te responderemos pronto.');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_widget_settings');
    }
};
