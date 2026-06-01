<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;
use App\Models\WithdrawalMethod;
use App\Models\Category; // <-- ADDED: Import the Category model

class SettingController extends Controller
{
    public function index()
    {
        // 1. Fetch global settings
        $platformCut = Setting::where('key', 'platform_cut_percentage')->value('value') ?? '5';
        $withdrawalThreshold = Setting::where('key', 'withdrawal_free_threshold')->value('value') ?? '500000';

        // 2. Fetch all withdrawal methods
        $withdrawalMethods = WithdrawalMethod::all();

        // 3. Fetch all categories (NEW)
        $categories = Category::all();

        return Inertia::render('admin/settings', [
            'settings' => [
                'platform_cut_percentage' => $platformCut,
                'withdrawal_free_threshold' => $withdrawalThreshold,
            ],
            'withdrawalMethods' => $withdrawalMethods,
            'categories' => $categories, // <-- Passed to React prop
        ]);
    }

    public function update(Request $request)
    {
        // 1. Validate everything
        $validated = $request->validate([
            // Global Settings
            'platform_cut_percentage' => 'required|numeric|min:0|max:100',
            'withdrawal_free_threshold' => 'required|numeric|min:0',

            // Withdrawal Methods
            'withdrawal_methods' => 'nullable|array',
            'withdrawal_methods.*.id' => 'nullable|exists:withdrawal_methods,id',
            'withdrawal_methods.*.name' => 'required|string|max:255',
            'withdrawal_methods.*.fee' => 'required|numeric|min:0',
            'withdrawal_methods.*.is_active' => 'required|boolean',

            // Categories (NEW)
            'categories' => 'nullable|array',
            'categories.*.id' => 'nullable|exists:categories,id',
            'categories.*.name' => 'required|string|max:100',
            'categories.*.slug' => 'required|string|max:100',
        ]);

        // 2. Save Global Settings
        Setting::updateOrCreate(
            ['key' => 'platform_cut_percentage'],
            ['value' => $validated['platform_cut_percentage']]
        );

        Setting::updateOrCreate(
            ['key' => 'withdrawal_free_threshold'],
            ['value' => $validated['withdrawal_free_threshold']]
        );

        // 3. Process the Withdrawal Methods
        $incomingMethodIds = [];

        if (isset($validated['withdrawal_methods'])) {
            foreach ($validated['withdrawal_methods'] as $methodData) {
                if (!empty($methodData['id'])) {
                    $method = WithdrawalMethod::find($methodData['id']);
                    $method->update([
                        'name' => $methodData['name'],
                        'fee' => $methodData['fee'],
                        'is_active' => $methodData['is_active'],
                    ]);
                    $incomingMethodIds[] = $method->id;
                } else {
                    $newMethod = WithdrawalMethod::create([
                        'name' => $methodData['name'],
                        'fee' => $methodData['fee'],
                        'is_active' => $methodData['is_active'],
                    ]);
                    $incomingMethodIds[] = $newMethod->id;
                }
            }
        }
        WithdrawalMethod::whereNotIn('id', $incomingMethodIds)->delete();

        // 4. Process the Categories (NEW)
        $incomingCategoryIds = [];

        if (isset($validated['categories'])) {
            foreach ($validated['categories'] as $catData) {
                if (!empty($catData['id'])) {
                    // Update existing category
                    $category = Category::find($catData['id']);
                    $category->update([
                        'name' => $catData['name'],
                        'slug' => $catData['slug'],
                    ]);
                    $incomingCategoryIds[] = $category->id;
                } else {
                    // Create new category
                    $newCategory = Category::create([
                        'name' => $catData['name'],
                        'slug' => $catData['slug'],
                    ]);
                    $incomingCategoryIds[] = $newCategory->id;
                }
            }
        }

        // Cleanup Deleted Categories
        Category::whereNotIn('id', $incomingCategoryIds)->delete();

        return back()->with('success', __('Platform settings updated successfully.'));
    }
}
