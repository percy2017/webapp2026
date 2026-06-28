<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            // JSON list of `media.id` values that this message references.
            // We don't copy the file into the message's media collection
            // anymore — the canonical file lives in the Media library and
            // the message just keeps the id list so the renderer can
            // resolve it on read.
            $table->json('media_ids')->nullable()->after('content');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropColumn('media_ids');
        });
    }
};
