<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    // An Order Item belongs to a specific Master Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // An Order Item belongs to a Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
