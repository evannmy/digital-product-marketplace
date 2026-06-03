<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Order;       // <-- NEW IMPORT
use App\Models\OrderItem;   // <-- NEW IMPORT
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\CartItem;
use App\Models\ProductMedia;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // 1. Start the query builder and add 'withAvg'
        $query = \App\Models\Product::with(['seller', 'category', 'media'])
            ->where('is_active', true)
            // ---> Ensure the product hasn't been locked by an Admin <---
            ->where('is_locked', false)
            // Ensure the creator/seller hasn't been suspended!
            ->whereHas('seller', function ($q) {
                $q->where('is_active', true);
            })
            // This line tells Laravel: "Look at the 'reviews' relationship, 
            // average the 'rating' column, and remember it."
            ->withAvg('reviews', 'rating');

        // 2. Apply Text Search
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                    ->orWhere('description', 'like', $searchTerm)
                    ->orWhereHas('seller', function ($sq) use ($searchTerm) {
                        $sq->where('name', 'like', $searchTerm)
                            ->orWhere('username', 'like', $searchTerm);
                    });
            });
        }

        // 3. Apply Category Filter (--- UPDATED TO USE SLUG ---)
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // 4. Apply Sorting
        $sort = $request->input('sort', 'newest');

        match ($sort) {
            'price_asc'   => $query->orderBy('price', 'asc'),
            'price_desc'  => $query->orderBy('price', 'desc'),
            'rating_desc' => $query->orderBy('reviews_avg_rating', 'desc'),
            default       => $query->latest(),
        };

        // 5. Execute the query
        $products = $query->paginate(12)->withQueryString();
        $categories = \App\Models\Category::all();

        return Inertia::render('welcome', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category, // <-- UPDATED: Passing back 'category' instead of 'category_id'
                'sort' => $request->sort
            ]
        ]);
    }

    public function flashSale(Request $request)
    {
        // 1. CEK GLOBAL: Apakah ada SETIDAKNYA SATU produk yang sedang diskon saat ini?
        $hasActiveFlashSale = \App\Models\Product::where('is_active', true)
            ->where('is_locked', false)
            ->whereNotNull('discount_price')
            ->where('discount_price', '>', 0)
            ->whereNotNull('discount_starts_at')
            ->whereNotNull('discount_ends_at')
            ->where('discount_starts_at', '<=', now())
            ->where('discount_ends_at', '>=', now())
            ->exists();

        // 2. JIKA TIDAK ADA: Langsung tendang ke halaman beranda (Early Return)
        if (!$hasActiveFlashSale) {
            // Pesan ini akan ditangkap oleh flash prop di React dan dimunculkan sebagai Toast Error
            return redirect('/')->with('error', 'Flash Sale is currently unavailable.');
        }

        // 3. JIKA ADA: Lanjutkan eksekusi query seperti biasa
        $query = \App\Models\Product::with(['seller', 'media', 'category'])
            ->where('is_active', true)
            ->where('is_locked', false)
            ->whereNotNull('discount_price')
            ->where('discount_price', '>', 0)
            ->whereNotNull('discount_starts_at')
            ->whereNotNull('discount_ends_at')
            ->where('discount_starts_at', '<=', now())
            ->where('discount_ends_at', '>=', now());

        // Filter Pencarian
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                    ->orWhereHas('seller', function ($sellerQuery) use ($searchTerm) {
                        $sellerQuery->where('name', 'like', $searchTerm);
                    });
            });
        }

        // Filter Kategori
        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Sortir
        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'price_asc' => $query->orderBy('discount_price', 'asc'),
            'price_desc' => $query->orderBy('discount_price', 'desc'),
            'rating_desc' => $query->withAvg('reviews', 'rating')->orderByDesc('reviews_avg_rating'),
            'newest' => $query->latest(),
            default => $query->latest(),
        };

        $products = $query->paginate(12)->withQueryString();

        $categories = \App\Models\Category::whereHas('products', function ($q) {
            $q->where('is_active', true)
                ->where('is_locked', false)
                ->whereNotNull('discount_price')
                ->where('discount_price', '>', 0)
                ->whereNotNull('discount_starts_at')
                ->whereNotNull('discount_ends_at')
                ->where('discount_starts_at', '<=', now())
                ->where('discount_ends_at', '>=', now());
        })->get();

        return \Inertia\Inertia::render('flash-sale/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'sort']),
        ]);
    }

    public function create(): Response
    {
        // Fetch all categories to populate the dropdown menu
        $categories = Category::orderBy('name')->get();

        return Inertia::render('products/create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        // 1. Update validation for the new media gallery
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'product_file' => 'required|file|max:51200', // The actual digital deliverable (50MB max)
            'media' => 'nullable|array|max:10', // Let's limit it to 10 files max per product
            'media.*' => [
                'file',
                function ($attribute, $value, $fail) {
                    $mimeType = $value->getMimeType();
                    $sizeInKb = $value->getSize() / 1024; // Convert bytes to KB

                    if (str_starts_with($mimeType, 'video/')) {
                        // Video limit: 20MB (20480 KB)
                        if ($sizeInKb > 20480) {
                            $fail('Videos must not be larger than 20MB.');
                        }
                    } elseif (str_starts_with($mimeType, 'image/')) {
                        // Image limit: 5MB (5120 KB)
                        if ($sizeInKb > 5120) {
                            $fail('Images must not be larger than 5MB.');
                        }
                    } else {
                        $fail('The file must be a valid image (jpeg, png, webp) or video (mp4, mov).');
                    }
                },
            ],
        ]);

        // 2. Handle the Digital File (Private Disk)
        $filePath = $request->file('product_file')->store('digital_products');

        // 3. Create the Product First
        // (We removed image_path here, and rely on the model to auto-generate the slug)
        $product = Product::create([
            'seller_id' => $request->user()->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'file_path' => $filePath,
            'is_active' => true,
        ]);

        // 4. Handle the Media Gallery Uploads (Public Disk)
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                // Determine if it's an image or a video based on mime type
                $mimeType = $file->getMimeType();
                $fileType = str_starts_with($mimeType, 'video/') ? 'video' : 'image';

                // Store the file publicly
                $path = $file->store('product-media', 'public');

                // Save to our new product_media table
                ProductMedia::create([
                    'product_id' => $product->id,
                    'file_path' => $path,
                    'file_type' => $fileType,
                    'sort_order' => $index, // Preserves the order they uploaded them in
                ]);
            }
        }

        // Send the user back to the marketplace grid with a success message!
        return redirect()->route('products.mine')->with('success', __('Product published successfully with media gallery!'));
    }

    public function show(Request $request, Product $product)
    {
        $product->load(['seller', 'category', 'reviews.user', 'media']);

        $user = $request->user();
        $isAdmin = $user && $user->role === 'admin';
        $isOwner = $user && $product->seller && $user->id === $product->seller->id;

        if (! $isAdmin && ! $isOwner) {
            // ---> FIXED: Now we explicitly check if the product is locked <---
            abort_if(
                ! $product->is_active ||
                    $product->is_locked ||     // <-- ADD THIS
                    ! $product->seller->is_active,
                404
            );
        }

        // Load average rating
        $product->loadAvg('reviews', 'rating');

        // 2. Safely check for purchase only if the user is logged in
        $hasPurchased = false;
        $isInCart = false;
        $pendingOrderId = null; // <-- NEW: Variable to hold the pending order ID

        if ($user) {
            // Check if purchased successfully
            $hasPurchased = \App\Models\OrderItem::where('product_id', $product->id)
                ->whereHas('order', function ($query) use ($user) {
                    $query->where('buyer_id', $user->id)
                        ->where('status', 'success');
                })
                ->exists();

            // Check if currently in cart
            $isInCart = \App\Models\CartItem::where('product_id', $product->id)
                ->whereHas('cart', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->exists();

            // --- NEW: Check if there is an active pending order ---
            $pendingOrder = \App\Models\OrderItem::where('product_id', $product->id)
                ->whereHas('order', function ($query) use ($user) {
                    $query->where('buyer_id', $user->id)
                        ->where('status', 'pending');
                })
                ->first();

            if ($pendingOrder) {
                $pendingOrderId = $pendingOrder->order_id;
            }
        }

        // 3. Render the page with the necessary auth props
        return Inertia::render('products/show', [
            'product' => $product,
            'hasPurchased' => $hasPurchased,
            'isInCart' => $isInCart,
            'pendingOrderId' => $pendingOrderId, // <-- NEW: Passed to React!
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function download(Request $request, Product $product)
    {
        $user = $request->user();

        // --- 1. Access Control Logic ---
        $isOwner = $user->id === $product->seller_id;
        $isAdmin = $user->role === 'admin';
        $hasPurchased = false;

        // Only query the database for a purchase if they aren't the owner or admin
        if (!$isOwner && !$isAdmin) {
            $hasPurchased = OrderItem::where('product_id', $product->id)
                ->whereHas('order', function ($query) use ($user) {
                    $query->where('buyer_id', $user->id)
                        ->where('status', 'success');
                })
                ->exists();
        }

        // --- 2. Security Gate ---
        if (!$isOwner && !$hasPurchased && !$isAdmin) {
            abort(403, __('Unauthorized. You must purchase this product to download it.'));
        }

        // --- 3. File Verification ---
        // Make sure the path actually exists in the DB before checking the disk
        if (!$product->file_path || !Storage::exists($product->file_path)) {
            abort(404, __('Digital file not found on the server.'));
        }

        // --- 4. Professional Filename Formatting ---
        // Extracts the original extension (e.g., 'zip', 'pdf')
        $extension = pathinfo($product->file_path, PATHINFO_EXTENSION);

        // Creates a clean, URL-safe name (e.g., 'my-awesome-ebook.zip')
        $cleanFilename = Str::slug($product->title) . '.' . $extension;

        return Storage::download($product->file_path, $cleanFilename);
    }

    public function edit(Request $request, Product $product)
    {
        // 1. Verify ownership
        if ($request->user()->id !== $product->seller_id) {
            abort(403, __('Unauthorized action. You do not own this product.'));
        }

        // 2. LOAD THE MEDIA GALLERY! (Crucial for the React frontend)
        $product->load('media');

        $categories = Category::orderBy('name')->get();

        // 3. Ensure the render path matches your React component location
        return Inertia::render('products/edit', [
            'product' => $product,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Product $product)
    {
        // 1. Security Layer: Verify ownership
        if ($request->user()->id !== $product->seller_id) {
            abort(403, __('Unauthorized action.'));
        }

        // 2. Validation (Updated for media gallery)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'product_file' => 'nullable|file|max:51200', // The digital asset (optional on update)
            'media' => 'nullable|array|max:10', // New gallery upload
            'media.*' => [
                'file',
                function ($attribute, $value, $fail) {
                    $mimeType = $value->getMimeType();
                    $sizeInKb = $value->getSize() / 1024; // Convert bytes to KB

                    if (str_starts_with($mimeType, 'video/')) {
                        // Video limit: 20MB (20480 KB)
                        if ($sizeInKb > 20480) {
                            $fail('Videos must not be larger than 20MB.');
                        }
                    } elseif (str_starts_with($mimeType, 'image/')) {
                        // Image limit: 5MB (5120 KB)
                        if ($sizeInKb > 5120) {
                            $fail('Images must not be larger than 5MB.');
                        }
                    } else {
                        $fail('The file must be a valid image (jpeg, png, webp) or video (mp4, mov).');
                    }
                },
            ],
        ]);

        // 3. Handle Digital File Replacement (Private Disk)
        if ($request->hasFile('product_file')) {
            // Delete the old secure file to save server space
            if ($product->file_path) {
                Storage::delete($product->file_path);
            }
            $product->file_path = $request->file('product_file')->store('digital_products');
        }

        // 4. Update the basic details to MySQL
        // (Slug updates automatically if the title changes thanks to your Model booted method!)
        $product->update([
            'title' => $validated['title'],
            'category_id' => $validated['category_id'],
            'price' => $validated['price'],
            'description' => $validated['description'],
        ]);

        // 5. Handle New Media Gallery Uploads (Public Disk)
        if ($request->hasFile('media')) {

            /* * OPTIONAL: If you want uploading new files to completely REPLACE the old gallery,
         * uncomment this block to delete the old media first:
         *
         * foreach ($product->media as $oldMedia) {
         * Storage::disk('public')->delete($oldMedia->file_path);
         * $oldMedia->delete();
         * }
         */

            // Find the current highest sort_order so we can append new files to the end
            $startingSortOrder = $product->media()->max('sort_order') ?? -1;

            foreach ($request->file('media') as $index => $file) {
                $mimeType = $file->getMimeType();
                $fileType = str_starts_with($mimeType, 'video/') ? 'video' : 'image';

                $path = $file->store('product-media', 'public');

                ProductMedia::create([
                    'product_id' => $product->id,
                    'file_path' => $path,
                    'file_type' => $fileType,
                    'sort_order' => $startingSortOrder + 1 + $index, // Append perfectly
                ]);
            }
        }

        // 6. Delete Media the user removed in the UI
        if ($request->has('remove_media') && is_array($request->remove_media)) {
            // Find media belonging to this product that the user wants deleted
            $mediaToDelete = ProductMedia::where('product_id', $product->id)
                ->whereIn('id', $request->remove_media)
                ->get();

            foreach ($mediaToDelete as $media) {
                // Delete the actual file from the storage disk
                Storage::disk('public')->delete($media->file_path);
                // Delete the database row
                $media->delete();
            }
        }

        // 6. Return the seller to their product page using the SLUG!
        return redirect()->route('products.mine', $product->slug)->with('success', __('Product updated successfully!'));
    }

    public function destroy(Request $request, Product $product)
    {
        // 1. Security Layer: Verify ownership
        if ($request->user()->id !== $product->seller_id) {
            abort(403, __('Unauthorized action. You cannot delete someone else\'s product.'));
        }

        // 2. Always delete public promotional media to save server space
        foreach ($product->media as $mediaItem) {
            Storage::disk('public')->delete($mediaItem->file_path);
        }

        // 3. THE SMART CHECK: Have there been any sales?
        // (Requires the orderItems relationship on your Product model)
        $hasSales = $product->orderItems()->exists();

        if ($hasSales) {
            // --- SCENARIO A: Product has buyers ---
            // Keep the source file intact so past buyers can still download it.
            // Soft delete the product so it vanishes from the public marketplace.
            $product->delete();

            return redirect()->route('products.mine')
                ->with('success', __('Product hidden from store, but kept available in libraries for past buyers.'));
        } else {
            // --- SCENARIO B: Product has 0 sales ---
            // Nobody needs this. Destroy the heavy source file to save server storage.
            if ($product->file_path) {
                Storage::delete($product->file_path);
            }

            // Permanently wipe the database row, bypassing Soft Deletes
            $product->forceDelete();

            return redirect()->route('products.mine')
                ->with('success', __('Product and all files permanently deleted.'));
        }
    }

    public function toggleActive(Product $product)
    {
        // Security check 1: Only the owner can toggle it
        if ($product->seller_id !== Auth::id()) {
            abort(403);
        }

        // Security check 2: Enforce the Admin Lock
        if ($product->is_locked) {
            return back()->with('error', __('Cannot publish this product. It has been disabled by an Administrator.'));
        }

        // Flip the current status and save
        $product->update([
            'is_active' => !$product->is_active
        ]);

        // --- THE FIX: Create the dynamic message in the backend ---
        if ($product->is_active) {
            return back()->with('success', __('":title" is now published.', ['title' => $product->title]));
        } else {
            return back()->with('success', __('":title" is now hidden.', ['title' => $product->title]));
        }
    }

    public function mine(Request $request)
    {
        $userId = $request->user()->id;

        // 1. Fetch the seller's inventory
        $products = Product::where('seller_id', $userId)
            ->with('category')
            ->latest()
            ->get();

        // 2. FIXED: Calculate Total Sales using OrderItems and Master Orders
        $totalSales = OrderItem::whereHas('product', function ($query) use ($userId) {
            $query->where('seller_id', $userId);
        })
            ->whereHas('order', function ($query) {
                $query->where('status', 'success');
            })
            ->count();

        // 3. FIXED: Calculate Total Revenue using OrderItems and Master Orders
        $totalRevenue = OrderItem::whereHas('product', function ($query) use ($userId) {
            $query->where('seller_id', $userId);
        })
            ->whereHas('order', function ($query) {
                $query->where('status', 'success');
            })
            ->sum('price');

        // 4. Send everything to the React frontend
        return Inertia::render('products/mine', [
            'products' => $products,
            'stats' => [
                'totalSales' => $totalSales,
                'totalRevenue' => $totalRevenue,
            ]
        ]);
    }
}
