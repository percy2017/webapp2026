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
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            // The user who owns this subscription. When the user is
            // deleted we cascade so the push subscription (which has no
            // meaning without an owner) doesn't linger.
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            // The endpoint URL provided by the browser's push service
            // (FCM / Mozilla autopush / Apple). Each endpoint is unique.
            $table->string('endpoint', 768)->unique();
            // Public key used by the browser to encrypt the push payload
            // (p256dh). 88 chars of base64url ≈ 64 bytes after decode.
            $table->string('p256dh', 128);
            // Auth secret used to sign push payloads. 44 chars of
            // base64url ≈ 32 bytes after decode.
            $table->string('auth', 64);
            // Optional content-encoding (typically "aesgcm").
            $table->string('content_encoding', 32)->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
