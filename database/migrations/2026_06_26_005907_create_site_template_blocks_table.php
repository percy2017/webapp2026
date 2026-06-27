<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_template_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_template_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('type');
            $table->json('content');
            $table->boolean('visible')->default(true);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['site_template_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_template_blocks');
    }
};
