<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'category_id',
        'title',
        'description',
        'price',
        'file_path',
        'is_active',
        'image_path',
        'discount_price',
        'discount_starts_at',
        'discount_ends_at',
    ];

    protected $appends = ['is_discount_active'];

    protected function isDiscountActive(): Attribute
    {
        return Attribute::make(
            get: function () {
                // If any of the required discount fields are empty, no discount.
                if (!$this->discount_price || !$this->discount_starts_at || !$this->discount_ends_at) {
                    return false;
                }

                // Check if the current server time is exactly between the start and end dates
                return now()->between($this->discount_starts_at, $this->discount_ends_at);
            }
        );
    }

    // Force price to cast as a float in JSON responses (useful for React)
    protected function casts(): array
    {
        return [
            'price' => 'float',
            'is_active' => 'boolean',

            'discount_starts_at' => 'datetime',
            'discount_ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
