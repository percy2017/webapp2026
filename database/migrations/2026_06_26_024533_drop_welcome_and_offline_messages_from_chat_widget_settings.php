<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_widget_settings', function (Blueprint $table) {
            $table->dropColumn(['welcome_message', 'offline_message']);
        });
    }

    public function down(): void
    {
        Schema::table('chat_widget_settings', function (Blueprint $table) {
            $table->string('welcome_message')->default('¡Hola! ¿En qué podemos ayudarte?');
            $table->string('offline_message')->default('Estamos fuera de horario. Te responderemos pronto.');
        });
    }
};
