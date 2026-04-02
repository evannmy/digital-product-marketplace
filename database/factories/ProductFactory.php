<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraphs(3, true),
            'price' => fake()->randomFloat(2, 5, 200), // Random price between 5.00 and 200.00
            'file_path' => 'dummy/secure/product-file.zip', // A fake secure path for testing
            'is_active' => true,
        ];
    }
}
