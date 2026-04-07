import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Index({ products }: any) {
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
                                            By {product.seller.name}
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
