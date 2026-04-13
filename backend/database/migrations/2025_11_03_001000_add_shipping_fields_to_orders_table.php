<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_province')->nullable();
            $table->string('shipping_postal_code')->nullable();
            $table->string('shipping_method')->nullable();
            $table->integer('shipping_cost')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_name','customer_phone','shipping_address','shipping_city','shipping_province','shipping_postal_code','shipping_method','shipping_cost'
            ]);
        });
    }
};
