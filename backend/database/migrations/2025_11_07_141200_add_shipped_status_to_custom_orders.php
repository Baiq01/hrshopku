<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Alter enum to include 'shipped'
        // This uses raw SQL as altering enum via Blueprint is not supported directly
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `custom_orders` MODIFY `status` ENUM('pending','approved','rejected','in_production','shipped','completed','canceled') NOT NULL DEFAULT 'pending'");
        } else {
            // For sqlite/postgres fallback: no-op or recreate column if needed
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `custom_orders` MODIFY `status` ENUM('pending','approved','rejected','in_production','completed','canceled') NOT NULL DEFAULT 'pending'");
        }
    }
};