<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Crucial Note: Notice we are NOT adding seller_id or platform_fee here!
            // Those belong exclusively in the order_items table.

            // 1. How are they paying right now? (e.g., 'manual', 'midtrans')
            $table->string('payment_method')->nullable()->after('total_amount');

            // 2. For manual bank transfers (stores the image path of the receipt)
            $table->string('payment_proof')->nullable()->after('payment_method');

            // 3. For the future Midtrans integration
            $table->string('transaction_id')->nullable()->unique()->after('payment_proof');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            //
        });
    }
};
