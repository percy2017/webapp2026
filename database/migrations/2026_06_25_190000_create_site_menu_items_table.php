<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('label', 80);
            $table->string('href', 255);
            $table->string('location', 30)->default('primary');
            $table->integer('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['location', 'sort']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_menu_items');
    }
};
