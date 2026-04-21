<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'product_id',
        'price',
        'status',
    ];

    // A transaction belongs to the user who bought it
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    // A transaction belongs to a specific product
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
