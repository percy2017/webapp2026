<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->string('sender_type')->nullable()->default(null)->change();
            $table->index(['sender_type', 'read_at'], 'chat_messages_unread_idx');
        });
    }

    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropIndex('chat_messages_unread_idx');
            $table->string('sender_type')->default('user')->change();
        });
    }
};
