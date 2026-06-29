<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla `chat_messages` consolidada — incluye la columna `media_ids`
 * (json) y el índice compuesto para queries de "unread".
 *
 * `sender_type` queda nullable sin default (en `up` original tenía
 * `default('user')` pero la migration ALTER subsiguiente removió ese
 * default — el estado final es nullable).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sender_type')->nullable();
            $table->text('content')->nullable();
            // JSON list of `media.id` values that this message references.
            // The canonical file lives in the Media library and the
            // message just keeps the id list so the renderer can resolve
            // it on read.
            $table->json('media_ids')->nullable()->after('content');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['chat_id', 'created_at']);
            $table->index(['sender_type', 'read_at'], 'chat_messages_unread_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
