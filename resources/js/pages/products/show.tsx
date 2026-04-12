import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Show({ product, hasPurchased }: any) {
    const { auth } = usePage().props as any;

    return (
        <AppLayout>
            <Head title={product.title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <div className="mb-6">
                        <Link
                            href="/products"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            &larr; Back to Marketplace
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-8 md:flex md:gap-8">
                            {/* Left Column: Product Details */}
                            <div className="md:w-2/3">
                                <div className="mb-2 text-sm font-semibold text-blue-600">
                                    {product.category.name}
                                </div>
                                <h1 className="mb-4 text-3xl font-bold text-gray-900">
                                    {product.title}
                                </h1>
                                <div className="prose mb-8 max-w-none text-gray-700">
                                    <p className="whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                </div>
                                {product.image_path && (
                                    <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                                        <img
                                            src={`/storage/${product.image_path}`}
                                            alt={product.title}
                                            className="h-auto max-h-[500px] w-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Purchasing Block */}
                            <div className="mt-8 md:mt-0 md:w-1/3">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <div className="mb-4 text-3xl font-bold text-green-600">
                                        Rp{' '}
                                        {product.price.toLocaleString('id-ID')}
                                    </div>
                                    <div className="mb-6 text-sm text-gray-600">
                                        <p>
                                            Created by:{' '}
                                            <span className="font-semibold text-gray-900">
                                                {product.seller.name}
                                            </span>
                                        </p>
                                        <p className="mt-1">
                                            Status:{' '}
                                            {product.is_active
                                                ? 'Available for download'
                                                : 'Unavailable'}
                                        </p>
                                    </div>

                                    {/* Action Buttons Logic */}
                                    <div className="mt-6">
                                        {auth.user &&
                                        auth.user.id === product.seller_id ? (
                                            <div className="rounded border border-gray-200 bg-gray-100 px-4 py-3 text-center font-medium text-gray-600">
                                                You own this product
                                            </div>
                                        ) : hasPurchased ? (
                                            <a
                                                href={`/products/${product.id}/download`}
                                                className="block w-full rounded bg-green-600 px-4 py-3 text-center font-semibold text-white transition duration-150 hover:bg-green-700"
                                            >
                                                Download Your Product
                                            </a>
                                        ) : product.is_active ? (
                                            <Link
                                                href={`/products/${product.id}/checkout`}
                                                method="post"
                                                as="button"
                                                className="w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white transition duration-150 hover:bg-blue-700"
                                            >
                                                Purchase Now
                                            </Link>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full cursor-not-allowed rounded bg-gray-400 px-4 py-3 font-semibold text-white"
                                            >
                                                Currently Unavailable
                                            </button>
                                        )}
                                    </div>

                                    {/* Edit and Delete buttons only appear for the product owner */}
                                    {auth.user &&
                                        auth.user.id === product.seller_id && (
                                            <div className="mt-4 border-t border-gray-200 pt-4">
                                                <Link
                                                    href={`/products/${product.id}/edit`}
                                                    className="mb-2 block w-full rounded bg-gray-100 px-4 py-2 text-center font-semibold text-gray-700 transition duration-150 hover:bg-gray-200"
                                                >
                                                    Edit Product
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                'Are you sure you want to delete this product? This action cannot be undone and the file will be permanently erased.',
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/products/${product.id}`,
                                                            );
                                                        }
                                                    }}
                                                    className="block w-full rounded bg-red-50 px-4 py-2 text-center font-semibold text-red-600 transition duration-150 hover:bg-red-100"
                                                >
                                                    Delete Product
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
