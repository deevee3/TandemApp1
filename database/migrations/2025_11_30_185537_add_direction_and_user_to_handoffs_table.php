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
        Schema::table('handoffs', function (Blueprint $table) {
            // Direction: agent_to_human, human_to_agent
            $table->string('direction')->default('agent_to_human')->after('conversation_id');
            
            // Who initiated the handoff (null for AI-initiated)
            $table->foreignId('user_id')->nullable()->after('direction')->constrained()->nullOnDelete();
            
            // Index for querying by direction
            $table->index('direction');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('handoffs', function (Blueprint $table) {
            $table->dropIndex(['direction']);
            $table->dropForeign(['user_id']);
            $table->dropColumn(['direction', 'user_id']);
        });
    }
};
