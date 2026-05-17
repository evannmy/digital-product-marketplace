<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    protected $fillable = ['seller_id', 'amount', 'fee', 'status', 'bank_name', 'account_number'];

    /**
     * Define the relationship to the User (Seller)
     */
    public function seller()
    {
        // This tells Laravel: "The seller_id column in this table points to the id column in the users table."
        return $this->belongsTo(User::class, 'seller_id');
    }
}
