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
        Schema::create('custom_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            
            // Detail pesanan custom
            $table->string('size')->nullable(); // S, M, L, XL, XXL atau custom
            $table->string('color')->nullable();
            $table->string('fabric_type')->nullable(); // Jenis kain
            $table->text('measurements')->nullable(); // JSON: lingkar dada, panjang, dll
            $table->text('design_notes')->nullable(); // Catatan desain khusus
            $table->string('reference_image')->nullable(); // Path gambar referensi
            $table->integer('quantity')->default(1);
            $table->decimal('estimated_price', 10, 2)->nullable();
            
            // Status: pending, approved, rejected, in_production, completed, canceled
            $table->enum('status', ['pending', 'approved', 'rejected', 'in_production', 'completed', 'canceled'])->default('pending');
            $table->text('admin_notes')->nullable(); // Catatan admin (alasan reject, dll)
            $table->timestamp('responded_at')->nullable();
            $table->foreignId('responded_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('custom_orders');
    }
};
