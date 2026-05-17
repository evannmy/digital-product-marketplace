<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // 1. Drop the manual receipt column
            $table->dropColumn('payment_proof');

            // 2. Ensure these are nullable since Midtrans fills them later
            $table->string('payment_method')->nullable()->change();
            $table->string('transaction_id')->nullable()->change();
            $table->string('snap_token')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_proof')->nullable();
            $table->string('payment_method')->nullable(false)->change();
            $table->string('transaction_id')->nullable(false)->change();
            $table->string('snap_token')->nullable(false)->change();
        });
    }
};
