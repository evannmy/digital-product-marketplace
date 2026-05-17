<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // 1. Drop the strict cascade rule
            $table->dropForeign(['seller_id']);

            // 2. Allow the seller_id to be empty
            $table->unsignedBigInteger('seller_id')->nullable()->change();

            // 3. Re-apply the foreign key with "nullOnDelete()"
            $table->foreign('seller_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete(); // <-- This stops MySQL from destroying the soft-deleted product!
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->unsignedBigInteger('seller_id')->nullable(false)->change();
            $table->foreign('seller_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
