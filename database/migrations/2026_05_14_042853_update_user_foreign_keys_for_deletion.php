<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Fix the Order Items table (Seller ID)
        Schema::table('order_items', function (Blueprint $table) {
            // Drop the old, strict foreign key
            $table->dropForeign(['seller_id']);

            // Ensure the column is allowed to be empty (nullable)
            $table->unsignedBigInteger('seller_id')->nullable()->change();

            // Re-apply the foreign key with "nullOnDelete()"
            $table->foreign('seller_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete(); // <-- This is the magic fix!
        });

        // 2. Fix the Orders table (Buyer ID) - Prevents the same error for buyers!
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['buyer_id']);

            $table->unsignedBigInteger('buyer_id')->nullable()->change();

            $table->foreign('buyer_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->unsignedBigInteger('seller_id')->nullable(false)->change();
            $table->foreign('seller_id')->references('id')->on('users');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['buyer_id']);
            $table->unsignedBigInteger('buyer_id')->nullable(false)->change();
            $table->foreign('buyer_id')->references('id')->on('users');
        });
    }
};
