import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Index({ products }: any) {
    return (
        <AppLayout>
            <Head title="Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Page Header */}
                    <div className="mb-6">
                        <h2 className="font-semibold text-2xl text-gray-800 leading-tight">Digital Marketplace</h2>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product: any) => (
                            <Link href={`/products/${product.id}`} key={product.id} className="block transition duration-150 ease-in-out hover:scale-[1.02]">
                                <div key={product.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 flex flex-col">
                                    <div className="text-sm text-blue-600 mb-1 font-semibold">
                                        {product.category.name}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                        {product.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                                        {product.description}
                                    </p>
                                    <div className="flex justify-between items-center mt-auto border-t pt-4">
                                        <span className="text-sm text-gray-500">By {product.seller.name}</span>
                                        <span className="text-lg font-bold text-green-600">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State */}
                    {products.length === 0 && (
                        <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
                            No digital products available at the moment.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}