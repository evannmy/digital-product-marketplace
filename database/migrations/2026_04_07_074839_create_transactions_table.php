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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            // Who bought it?
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            // What did they buy?
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            // If the seller changes the product price tomorrow, this historical record must not change.
            $table->decimal('amount', 12, 2);
            // 'pending', 'success', 'failed'
            $table->string('status')->default('success');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
