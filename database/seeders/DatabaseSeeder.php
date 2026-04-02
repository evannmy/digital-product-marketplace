<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Static Testing Accounts
        $admin = User::factory()->create([
            'name' => 'System Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $seller = User::factory()->create([
            'name' => 'Test Seller',
            'email' => 'seller@test.com',
            'password' => Hash::make('password'),
            'role' => 'seller',
        ]);

        $buyer = User::factory()->create([
            'name' => 'Test Buyer',
            'email' => 'buyer@test.com',
            'password' => Hash::make('password'),
            'role' => 'buyer',
        ]);

        // 2. Create 5 Dummy Categories
        $categories = Category::factory(5)->create();

        // 3. Create 15 Dummy Products assigned to the Test Seller
        // We iterate so we can randomly assign one of the 5 categories to each product
        for ($i = 0; $i < 15; $i++) {
            Product::factory()->create([
                'seller_id' => $seller->id,
                'category_id' => $categories->random()->id,
            ]);
        }
    }
}
