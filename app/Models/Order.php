<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $guarded = [];

    // An Order belongs to a Buyer (User)
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    // An Order has many Order Items
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
