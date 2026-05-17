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
        Schema::table('order_items', function (Blueprint $table) {
            // Who gets paid for this specific item?
            $table->foreignId('seller_id')->after('product_id')->constrained('users');

            // Quantity (useful for bulk license purchases)
            $table->integer('quantity')->default(1)->after('seller_id');

            // The Financial Splits for THIS specific item
            $table->decimal('platform_fee', 12, 2)->default(0)->after('price');
            $table->decimal('seller_earnings', 12, 2)->default(0)->after('platform_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            //
        });
    }
};
