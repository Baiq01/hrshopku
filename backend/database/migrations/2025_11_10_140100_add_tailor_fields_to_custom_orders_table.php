<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            $table->foreignId('tailor_id')->nullable()->after('user_id')->constrained('users')->onDelete('set null');
            $table->string('tailor_status')->default('pending')->after('status'); // pending, accepted, rejected
            $table->text('tailor_notes')->nullable()->after('tailor_status');
            $table->timestamp('tailor_responded_at')->nullable()->after('tailor_notes');
        });
    }

    public function down(): void
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            $table->dropForeign(['tailor_id']);
            $table->dropColumn(['tailor_id', 'tailor_status', 'tailor_notes', 'tailor_responded_at']);
        });
    }
};
