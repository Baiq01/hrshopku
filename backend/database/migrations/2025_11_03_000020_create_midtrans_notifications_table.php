<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('midtrans_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->nullable();
            $table->string('order_number')->nullable();
            $table->string('signature_key')->nullable()->index();
            $table->longText('payload')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }
    public function down()
    {
        Schema::dropIfExists('midtrans_notifications');
    }
};
