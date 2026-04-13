import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Show({ creator, products }: any) {
    return (
        <AppLayout>
            <Head title={`${creator.name}'s Store`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* --- CREATOR PROFILE HEADER --- */}
                    <div className="mb-8 overflow-hidden border border-gray-100 bg-white shadow-sm sm:rounded-lg">
                        <div className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
                            {/* Avatar Placeholder */}
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                                {creator.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {creator.name}
                                </h1>
                                <p className="mt-1 text-gray-500">
                                    Digital Creator • Joined{' '}
                                    {new Date(creator.created_at).getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* --- PRODUCT GRID --- */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Available Products ({products.length})
                        </h2>
                    </div>

                    {products.length === 0 ? (
                        <div className="rounded-lg border border-gray-100 bg-white p-8 text-center text-gray-500">
                            This creator doesn't have any active products yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {products.map((product: any) => (
                                <Link
                                    href={`/products/${product.id}`}
                                    key={product.id}
                                    className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
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

                                    <div className="grow p-5">
                                        <div className="mb-2 flex items-start justify-between">
                                            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                                                {product.category.name}
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                Rp{' '}
                                                {product.price.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </span>
                                        </div>
                                        <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900">
                                            {product.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
