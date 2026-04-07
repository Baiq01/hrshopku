<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->text('details')->nullable()->after('description');
            // store sizes as JSON string, e.g. ["S","M","L","XL"]
            $table->json('sizes')->nullable()->after('details');
        });
    }
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['details','sizes']);
        });
    }
};
