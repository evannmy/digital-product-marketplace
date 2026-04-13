import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../layouts/app-layout';

export default function Index({ products, categories, filters }: any) {
    // 1. Initialize state with the URL parameters (if they exist)
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryId, setCategoryId] = useState(filters?.category_id || '');

    // 2. The function that triggers the server request
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        // Send a GET request to /products with the search parameters
        router.get(
            '/products',
            { search, category_id: categoryId },
            {
                preserveState: true,
                replace: true, // Prevents filling up the browser back-button history
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

                    {/* --- NEW SEARCH AND FILTER BAR --- */}
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
                        <div className="sm:w-64">
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
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
                        >
                            Filter
                        </button>
                    </form>
                    {/* --- END SEARCH AND FILTER BAR --- */}

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
                                    className="flex flex-col overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg"
                                >
                                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                                        {product.image_path ? (
                                            <img
                                                src={`/storage/${product.image_path}`}
                                                alt={product.title}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <span>No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-1 text-sm font-semibold text-blue-600">
                                        {product.category.name}
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
                                            <Link
                                                href={`/creator/${product.seller.id}`}
                                                className="font-semibold text-blue-600 hover:underline"
                                            >
                                                {product.seller.name}
                                            </Link>
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
                            No digital products available at the moment.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
