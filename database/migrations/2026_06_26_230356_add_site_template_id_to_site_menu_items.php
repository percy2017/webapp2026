<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_menu_items', function (Blueprint $table) {
            $table->foreignId('site_template_id')
                ->nullable()
                ->after('location')
                ->constrained('site_templates')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('site_menu_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('site_template_id');
        });
    }
};
