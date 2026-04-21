import type { PageProps } from '@inertiajs/core';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
// 1. Import your AppLayout
import AppLayout from '../../layouts/app-layout';

interface Seller {
    id: number;
    name: string;
}

interface Product {
    id: number;
    title: string;
    price: number;
    image_path: string | null;
    seller: Seller;
}

interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    product: Product;
}

interface Cart {
    id: number;
    user_id: number;
    items: CartItem[];
}

interface CartPageProps extends PageProps {
    cart: Cart | null;
}

export default function CartPage({ cart }: CartPageProps) {
    useEffect(() => {
        // This forces Inertia to fetch fresh database data every time
        // the cart opens, completely ignoring the stale memory cache.
        router.reload({ only: ['cart'] });
    }, []);

    const items = cart?.items || [];
    const subtotal = items.reduce(
        (total, item) => total + item.product.price,
        0,
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const removeItem = (itemId: number) => {
        if (confirm('Remove this digital product from your cart?')) {
            router.delete(route('cart.destroy', itemId), {
                preserveScroll: true,
            });
        }
    };

    const handleCheckout = () => {
        router.post(
            route('checkout.process'),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        // 2. Wrap everything in AppLayout
        <AppLayout>
            <Head title="My Shopping Cart" />

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Your Cart
                        </h1>
                    </div>

                    {items.length === 0 ? (
                        <div className="rounded-lg border border-gray-100 bg-white p-12 text-center shadow-sm">
                            <ShoppingCartEmptyState />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            <div className="lg:col-span-8">
                                <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
                                    <ul className="divide-y divide-gray-100">
                                        {items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex p-6 sm:p-8"
                                            >
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                                    {item.product.image_path ? (
                                                        <img
                                                            src={`/storage/${item.product.image_path}`}
                                                            alt={
                                                                item.product
                                                                    .title
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            <ShoppingBag className="h-8 w-8 opacity-50" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="ml-6 flex flex-1 flex-col">
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <h3>
                                                            {item.product.title}
                                                        </h3>
                                                        <p className="ml-4">
                                                            {formatCurrency(
                                                                item.product
                                                                    .price,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        By{' '}
                                                        {
                                                            item.product.seller
                                                                .name
                                                        }
                                                    </p>

                                                    <div className="flex flex-1 items-end justify-between text-sm">
                                                        <p className="text-gray-500">
                                                            Digital Access
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeItem(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="flex items-center gap-1 font-medium text-red-600 hover:text-red-500"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Remove</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="lg:col-span-4">
                                <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Order summary
                                    </h2>

                                    <dl className="mt-6 space-y-4 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <dt>Subtotal</dt>
                                            <dd className="font-medium text-gray-900">
                                                {formatCurrency(subtotal)}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between border-t border-gray-100 pt-4">
                                            <dt className="text-base font-medium text-gray-900">
                                                Order total
                                            </dt>
                                            <dd className="text-base font-medium text-gray-900">
                                                {formatCurrency(subtotal)}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-6">
                                        <button
                                            onClick={handleCheckout}
                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-700"
                                        >
                                            Pay & Download Now
                                        </button>
                                    </div>
                                    <div className="mt-4 text-center text-sm text-gray-500">
                                        <p>
                                            or{' '}
                                            <Link
                                                href={route('products.index')}
                                                className="font-medium text-blue-600 hover:text-blue-500"
                                            >
                                                Continue Shopping
                                                <span aria-hidden="true">
                                                    {' '}
                                                    &rarr;
                                                </span>
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function ShoppingCartEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Your cart is empty
            </h2>
            <p className="mb-6 text-gray-500">
                Looks like you haven't added any digital products yet.
            </p>
            <Link
                href={route('products.index')}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
                Start Browsing <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}
