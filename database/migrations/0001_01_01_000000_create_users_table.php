<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla `users` consolidada — incluye todas las columnas que se
 * agregaron después del create inicial (2FA, phone, avatar).
 *
 * Estado final:
 *   - id
 *   - name
 *   - email (unique)
 *   - email_verified_at (nullable)
 *   - phone (nullable)
 *   - password
 *   - two_factor_secret (nullable, Fortify 2FA)
 *   - two_factor_recovery_codes (nullable)
 *   - two_factor_confirmed_at (nullable)
 *   - avatar_media_id (nullable, FK media.id nullOnDelete)
 *   - remember_token
 *   - timestamps
 *
 * Adicionalmente crea `password_reset_tokens` y `sessions` (tablas del
 * framework que viven en la misma migration histórica de Laravel).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('phone')->nullable()->after('email');
            $table->string('password');
            $table->text('two_factor_secret')->nullable()->after('password');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
            $table->unsignedBigInteger('avatar_media_id')->nullable()->after('phone');
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('avatar_media_id')
                ->references('id')
                ->on('media')
                ->nullOnDelete();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
