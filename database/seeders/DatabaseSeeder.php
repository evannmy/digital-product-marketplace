<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;          // <-- Make sure to import this
use App\Models\WithdrawalMethod; // <-- Make sure to import this
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- 1. CREATE STATIC TESTING ACCOUNTS ---
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'System Admin',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $seller = User::firstOrCreate(
            ['email' => 'seller@test.com'],
            [
                'name' => 'Test Seller',
                'username' => 'testseller',
                'password' => Hash::make('password'),
                'role' => 'seller',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $buyer = User::firstOrCreate(
            // ['email' => 'buyer@test.com'],
            ['email' => 'evanmaulanayafi@gmail.com'],
            [
                'name' => 'Test Buyer',
                'username' => 'testbuyer',
                'password' => Hash::make('password'),
                'role' => 'buyer',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // --- 2. SEED REALISTIC CATEGORIES ---
        $categoryNames = [
            'E-Books & Guides',
            'UI Kits & Templates',
            'Web Themes',
            'Icons & Fonts',
            'Software & Plugins',
            'Audio & Music',
            'Video & Animation',
            'Online Courses',
            'Photography',
            '3D Models',
            'Presentations',
            'Notion Templates',
            'Prompts & Presets'
        ];

        foreach ($categoryNames as $categoryName) {
            Category::firstOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName]
            );
        }

        // --- 3. SEED PLATFORM SETTINGS ---
        $settings = [
            ['key' => 'platform_fee_percentage', 'value' => '5'], // 5% platform cut
            ['key' => 'withdrawal_minimum', 'value' => '20000'],  // Rp 20.000 minimum
            ['key' => 'withdrawal_free_threshold', 'value' => '500000'], // Free over Rp 500k
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value']]
            );
        }

        // --- 4. SEED WITHDRAWAL METHODS ---
        $withdrawalMethods = [
            ['name' => 'Bank BCA', 'fee' => 2500, 'is_active' => true],
            ['name' => 'Bank Mandiri', 'fee' => 2500, 'is_active' => true],
            ['name' => 'Bank BNI', 'fee' => 2500, 'is_active' => true],
            ['name' => 'Bank BRI', 'fee' => 2500, 'is_active' => true],
            ['name' => 'GoPay', 'fee' => 1000, 'is_active' => true],
            ['name' => 'OVO', 'fee' => 1500, 'is_active' => true],
            ['name' => 'DANA', 'fee' => 1000, 'is_active' => true],
        ];

        foreach ($withdrawalMethods as $method) {
            WithdrawalMethod::firstOrCreate(
                ['name' => $method['name']], // <-- Changed to search by 'name' instead of 'code'
                [
                    'fee' => $method['fee'],
                    'is_active' => $method['is_active'],
                ]
            );
        }

        // --- 5. CREATE DUMMY PRODUCTS ---
        $categories = Category::all();

        // Only create dummy products if the seller doesn't have any yet
        if ($seller->products()->count() === 0) {
            for ($i = 0; $i < 15; $i++) {
                Product::factory()->create([
                    'seller_id' => $seller->id,
                    'category_id' => $categories->random()->id,
                ]);
            }
        }
    }
}
