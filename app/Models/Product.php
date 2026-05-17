<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Models\OrderItem;

class Product extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'seller_id',
        'category_id',
        'title',
        'description',
        'price',
        'file_path',
        'is_active',
        'discount_price',
        'discount_starts_at',
        'discount_ends_at',
        'is_locked'
    ];

    protected $appends = ['is_discount_active'];

    protected static function booted()
    {
        // When a product is being created, generate a unique slug
        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->title);
            }
        });

        // Optional: Update the slug if the title changes
        static::updating(function ($product) {
            if ($product->isDirty('title')) {
                $product->slug = static::generateUniqueSlug($product->title, $product->id);
            }
        });
    }

    // Helper method to ensure no two products have the exact same URL
    protected static function generateUniqueSlug($title, $ignoreId = 0)
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        // Check if slug exists (ignoring the current product if updating)
        while (static::where('slug', $slug)->where('id', '!=', $ignoreId)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }

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
            'is_locked' => 'boolean',
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

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function media()
    {
        return $this->hasMany(ProductMedia::class)->orderBy('sort_order');
    }

    /**
     * Get the order items associated with this product.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
