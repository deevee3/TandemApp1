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
        Schema::table('roles', function (Blueprint $table) {
            $table->string('code', 20)->unique()->nullable()->after('id');
            $table->decimal('hourly_rate', 10, 2)->nullable()->after('description');
            $table->index('code');
        });

        Schema::table('skills', function (Blueprint $table) {
            $table->string('code', 20)->unique()->nullable()->after('id');
            $table->decimal('hourly_rate', 10, 2)->nullable()->after('description');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropIndex(['code']);
            $table->dropColumn(['code', 'hourly_rate']);
        });

        Schema::table('skills', function (Blueprint $table) {
            $table->dropIndex(['code']);
            $table->dropColumn(['code', 'hourly_rate']);
        });
    }
};
