<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(4);
        $title = rtrim($title, '.');

        return [
            'seller_id' => User::factory(),
            'category_id' => Category::inRandomOrder()->value('id') ?? 1,

            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraphs(3, true),

            'file_path' => 'dummy/secure/product-file.zip',

            // --- UPDATED: Clean, non-decimal pricing (e.g., 50000, 120000, 450000) ---
            'price' => fake()->numberBetween(5, 50) * 10000,

            'discount_price' => null,
            'discount_starts_at' => null,
            'discount_ends_at' => null,

            'is_active' => true,
            'is_locked' => false,
        ];
    }
}
