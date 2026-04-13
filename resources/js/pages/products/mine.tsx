import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Mine({ products, stats }: any) {
    return (
        <AppLayout>
            <Head title="My Inventory" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Seller Dashboard
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Manage your digital products and track your
                                earnings.
                            </p>
                        </div>
                        <Link
                            href="/seller/products/create"
                            className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
                        >
                            + New Product
                        </Link>
                    </div>

                    {/* --- NEW ANALYTICS SECTION --- */}
                    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="rounded-full bg-green-100 p-4 text-green-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium tracking-wider text-gray-500 uppercase">
                                    Total Revenue
                                </p>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    Rp{' '}
                                    {stats.totalRevenue.toLocaleString('id-ID')}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="rounded-full bg-blue-100 p-4 text-blue-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium tracking-wider text-gray-500 uppercase">
                                    Total Sales
                                </p>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {stats.totalSales} Items
                                </h3>
                            </div>
                        </div>
                    </div>
                    {/* --- END ANALYTICS SECTION --- */}

                    {/* --- INVENTORY LIST --- */}
                    <div className="overflow-hidden border border-gray-100 bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                My Products
                            </h3>
                        </div>
                        {products.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                You haven't uploaded any products yet.
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-600">
                                        <th className="p-4">Product</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product: any) => (
                                        <tr
                                            key={product.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="p-4 font-medium text-gray-900">
                                                {product.title}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                Rp{' '}
                                                {product.price.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                >
                                                    {product.is_active
                                                        ? 'Active'
                                                        : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="space-x-3 p-4 text-right">
                                                <Link
                                                    href={`/seller/products/${product.id}/edit`}
                                                    className="font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="font-medium text-gray-600 hover:text-gray-800"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
