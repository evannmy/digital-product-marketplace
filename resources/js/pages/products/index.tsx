import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react'; // Removed useEffect and useRef
import AppLayout from '../../layouts/app-layout';

export default function Index({ products, categories, filters }: any) {
    // Safety check: guarantee filters is an object, not an array
    const safeFilters = Array.isArray(filters) ? {} : filters || {};

    // 1. Initialize State
    const [search, setSearch] = useState(safeFilters.search || '');
    const [categoryId, setCategoryId] = useState(safeFilters.category_id || '');
    const [sort, setSort] = useState(safeFilters.sort || 'newest');

    // 2. The manual submit function
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault(); // Stop the browser from doing a hard refresh

        // Send a single GET request with all 3 parameters at once
        router.get(
            '/products',
            { search, category_id: categoryId, sort },
            {
                preserveState: true,
                replace: true, // Prevents filling up the browser's back-button history
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Products" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl leading-tight font-semibold text-gray-800">
                            Digital Marketplace
                        </h2>
                    </div>

                    {/* --- SEARCH AND FILTER FORM --- */}
                    {/* Brought back the <form> wrapper and onSubmit */}
                    <form
                        onSubmit={handleFilter}
                        className="mb-8 flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:flex-row"
                    >
                        <div className="grow">
                            <input
                                type="text"
                                placeholder="Search products by title or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="sm:w-48">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories &&
                                    categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="sm:w-48">
                            <select
                                value={sort}
                                // Now this only updates React state, it doesn't trigger the server
                                onChange={(e) => setSort(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price_asc">
                                    Price: Low to High
                                </option>
                                <option value="price_desc">
                                    Price: High to Low
                                </option>
                                <option value="rating_desc">
                                    Highest Rated
                                </option>
                            </select>
                        </div>

                        {/* --- THE FILTER BUTTON IS BACK --- */}
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
                        >
                            Filter
                        </button>
                    </form>
                    {/* --- END SEARCH AND FILTER FORM --- */}

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product: any) => (
                            <Link
                                href={`/products/${product.id}`}
                                key={product.id}
                                className="block transition duration-150 ease-in-out hover:scale-[1.02]"
                            >
                                <div
                                    key={product.id}
                                    className="flex h-full flex-col overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg"
                                >
                                    <div
                                        className="relative mb-4 w-full overflow-hidden rounded bg-gray-100"
                                        style={{ aspectRatio: '16/9' }}
                                    >
                                        {product.image_path ? (
                                            <img
                                                src={`/storage/${product.image_path}`}
                                                alt={product.title}
                                                className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <span>No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-1 flex items-start justify-between">
                                        <div className="text-sm font-semibold text-blue-600">
                                            {product.category.name}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {product.reviews_avg_rating ? (
                                                <>
                                                    <span className="text-sm text-yellow-400">
                                                        ⭐
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {Number(
                                                            product.reviews_avg_rating,
                                                        ).toFixed(1)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">
                                                    No ratings
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900">
                                        {product.title}
                                    </h3>

                                    <p className="mb-4 line-clamp-2 grow text-sm text-gray-600">
                                        {product.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between border-t pt-4">
                                        <span className="text-sm text-gray-500">
                                            By:{' '}
                                            <span className="font-semibold text-blue-600 hover:underline">
                                                {product.seller.name}
                                            </span>
                                        </span>
                                        <span className="text-lg font-bold text-green-600">
                                            Rp{' '}
                                            {product.price.toLocaleString(
                                                'id-ID',
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State */}
                    {products.length === 0 && (
                        <div className="rounded-lg bg-white py-12 text-center text-gray-500 shadow-sm">
                            No digital products found matching your filters.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
