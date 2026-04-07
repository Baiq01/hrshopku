<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            $table->string('tracking_number')->nullable()->after('status');
            $table->string('shipping_courier')->nullable()->after('tracking_number');
            $table->timestamp('shipped_at')->nullable()->after('shipping_courier');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('custom_orders', function (Blueprint $table) {
            $table->dropColumn(['tracking_number', 'shipping_courier', 'shipped_at']);
        });
    }
};
