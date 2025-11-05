<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('subject')->nullable();
            $table->string('status')->default('new');
            $table->string('priority')->default('standard');
            $table->string('requester_type')->nullable();
            $table->string('requester_identifier')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('priority');
            $table->index('last_activity_at');
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->string('sender_type');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('content');
            $table->float('confidence')->nullable();
            $table->float('cost_usd')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
            $table->index('sender_type');
            $table->unique(['conversation_id', 'created_at']);
        });

        Schema::create('queues', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->integer('sla_first_response_minutes')->default(15);
            $table->integer('sla_resolution_minutes')->default(120);
            $table->json('skills_required')->nullable();
            $table->json('priority_policy')->nullable();
            $table->timestamps();

        });

        $driver = DB::connection()->getDriverName();

        if (in_array($driver, ['sqlite', 'pgsql'], true)) {
            DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS queues_default_unique ON queues(is_default) WHERE is_default = 1");
        }

        Schema::create('queue_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('queue_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->string('state')->default('queued');
            $table->timestamp('enqueued_at');
            $table->timestamp('dequeued_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['queue_id', 'conversation_id', 'state']);
            $table->index(['state', 'enqueued_at']);
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('queue_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('assigned_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->string('status')->default('assigned');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'status']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('handoffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->string('reason_code');
            $table->float('confidence')->nullable();
            $table->json('policy_hits')->nullable();
            $table->json('required_skills')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['conversation_id', 'created_at']);
            $table->index('reason_code');
        });
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if (in_array($driver, ['sqlite', 'pgsql'], true)) {
            $dropStatement = $driver === 'pgsql'
                ? 'DROP INDEX IF EXISTS queues_default_unique'
                : 'DROP INDEX IF EXISTS queues_default_unique';

            DB::statement($dropStatement);
        }
        Schema::dropIfExists('handoffs');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('queue_items');
        Schema::dropIfExists('queues');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
    }
};
