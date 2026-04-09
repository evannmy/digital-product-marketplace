import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function PurchasesIndex({ transactions }: any) {
    return (
        <AppLayout>
            <Head title="My Purchases" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            My Library
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Digital products you have purchased and can download
                            at any time.
                        </p>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="overflow-hidden bg-white p-12 text-center shadow-sm sm:rounded-lg">
                            <p className="mb-4 text-gray-500">
                                You haven't purchased any products yet.
                            </p>
                            <Link
                                href="/products"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Browse the Marketplace
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {transactions.map((transaction: any) => (
                                <div
                                    key={transaction.id}
                                    className="flex flex-col overflow-hidden border bg-white shadow-sm sm:rounded-lg"
                                >
                                    <div className="grow p-6">
                                        <div className="mb-1 text-xs font-semibold tracking-wider text-blue-600 uppercase">
                                            {transaction.product.category.name}
                                        </div>
                                        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-900">
                                            {transaction.product.title}
                                        </h3>
                                        <p className="mb-4 text-sm text-gray-500">
                                            By {transaction.product.seller.name}
                                        </p>
                                        <div className="text-xs text-gray-400">
                                            Purchased on:{' '}
                                            {new Date(
                                                transaction.created_at,
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between border-t bg-gray-50 p-4">
                                        <Link
                                            href={`/products/${transaction.product.id}`}
                                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                        >
                                            View Details
                                        </Link>

                                        {/* Standard <a> tag is required here for secure file downloading, exactly like the show page */}
                                        <a
                                            href={`/products/${transaction.product.id}/download`}
                                            className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
