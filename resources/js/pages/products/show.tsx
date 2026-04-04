import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Show({ product }: any) {
    return (
        <AppLayout>
            <Head title={product.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Back Navigation */}
                    <div className="mb-6">
                        <Link href="/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            &larr; Back to Marketplace
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8 md:flex md:gap-8">
                            
                            {/* Left Column: Product Details */}
                            <div className="md:w-2/3">
                                <div className="text-sm text-blue-600 font-semibold mb-2">
                                    {product.category.name}
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    {product.title}
                                </h1>
                                <div className="prose max-w-none text-gray-700 mb-8">
                                    <p className="whitespace-pre-wrap">{product.description}</p>
                                </div>
                            </div>

                            {/* Right Column: Purchasing Block */}
                            <div className="md:w-1/3 mt-8 md:mt-0">
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <div className="text-3xl font-bold text-green-600 mb-4">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </div>
                                    <div className="mb-6 text-sm text-gray-600">
                                        <p>Created by: <span className="font-semibold text-gray-900">{product.seller.name}</span></p>
                                        <p className="mt-1">Status: {product.is_active ? 'Available for download' : 'Unavailable'}</p>
                                    </div>
                                    <button className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded hover:bg-blue-700 transition duration-150">
                                        Purchase Now
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}