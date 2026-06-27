<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_menu_items', function (Blueprint $table) {
            $table->foreignId('parent_id')
                ->nullable()
                ->after('id')
                ->constrained('site_menu_items')
                ->cascadeOnDelete();
            $table->string('icon', 60)
                ->nullable()
                ->after('href');
            $table->index(['parent_id', 'sort']);
        });
    }

    public function down(): void
    {
        Schema::table('site_menu_items', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropIndex(['parent_id', 'sort']);
            $table->dropColumn(['parent_id', 'icon']);
        });
    }
};
