import type { PageProps } from '@inertiajs/core';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import {
    Trash2,
    ShoppingBag,
    ArrowRight,
    ShoppingCart,
    Package,
    AlertTriangle, // <-- ADDED: For the warning badge
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
import { Spinner } from '@/components/ui/spinner';

interface Seller {
    id: number;
    name: string;
    username: string;
}

interface Product {
    id: number;
    title: string;
    slug: string;
    price: number;
    image_path: string | null;
    media?: any[];
    seller: Seller;
    category?: { name: string };
    is_discount_active?: boolean;
    discount_price?: number;
}

interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    has_pending_order?: boolean; // <-- ADDED: To track pending status per item
    has_purchased_order?: boolean;
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

// --- Isolated Thumbnail Component for Cart Items ---
function CartItemThumbnail({ product }: { product: Product }) {
    const hasMedia = product.media && product.media.length > 0;
    const fallbackImage = product.image_path;

    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        hasMedia || fallbackImage ? 'loading' : 'loaded',
    );

    if (!hasMedia && !fallbackImage) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-50 to-purple-100 text-purple-300">
                <Package className="h-8 w-8" />
            </div>
        );
    }

    const isVideo = hasMedia && product.media![0].file_type === 'video';
    const srcPath = hasMedia ? product.media![0].file_path : fallbackImage;

    return (
        <div className="relative h-full w-full overflow-hidden bg-slate-100">
            {/* 1. Loading State */}
            {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                    <Spinner className="h-5 w-5 animate-spin text-purple-400" />
                </div>
            )}

            {/* 2. Error State */}
            {status === 'error' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-purple-300">
                    <Package className="mb-1 h-6 w-6 opacity-50" />
                    <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase opacity-70">
                        Error
                    </span>
                </div>
            )}

            {/* 3. Actual Media */}
            {isVideo ? (
                <div className="relative h-full w-full">
                    <video
                        src={`/storage/${srcPath}#t=0.1`}
                        className={`pointer-events-none h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedData={() => setStatus('loaded')}
                        onError={() => setStatus('error')}
                    />
                </div>
            ) : (
                <img
                    src={`/storage/${srcPath}`}
                    alt={product.title}
                    className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            )}
        </div>
    );
}

export default function CartPage({ cart }: CartPageProps) {
    const { flash } = usePage<any>().props;

    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { post: submitCheckout, processing: isCheckingOut } = useForm();

    useEffect(() => {
        router.reload({ only: ['cart'] });
    }, []);

    // --- Global Flash Message Listener ---
    useEffect(() => {
        if (flash?.error) toast(flash.error, 'error');

        if (flash?.success) toast(flash.success, 'success');

        if (flash?.info) toast(flash.info, 'info');

        if (flash?.error || flash?.success || flash?.info) {
            const currentState = window.history.state;

            if (currentState?.page?.props?.flash) {
                const newState = JSON.parse(JSON.stringify(currentState));
                newState.page.props.flash = {
                    success: null,
                    error: null,
                    info: null,
                };
                window.history.replaceState(newState, '', window.location.href);
            }
        }
    }, [flash]);

    const items = cart?.items || [];

    // --- NEW: Check if any item in the cart is blocking checkout ---
    const hasPendingItems = items.some((item) => item.has_pending_order);
    const hasPurchasedItems = items.some((item) => item.has_purchased_order);

    const isCheckoutBlocked = hasPendingItems || hasPurchasedItems;

    const getFinalPrice = (product: Product) => {
        return product.is_discount_active &&
            product.discount_price !== undefined
            ? product.discount_price
            : product.price;
    };

    const subtotal = items.reduce(
        (total, item) => total + getFinalPrice(item.product),
        0,
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const promptRemoveItem = (itemId: number) => {
        setItemToDelete(itemId);
    };

    const confirmRemoveItem = () => {
        if (!itemToDelete) return;

        setIsProcessing(true);

        router.delete(route('cart.destroy', itemToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                setItemToDelete(null);
                toast('Product removed from cart.', 'delete');
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleCheckout = () => {
        submitCheckout(route('checkout.process'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="My Cart - Soko" />

            <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                <Navbar />

                <main className="relative z-10 pt-32 pb-24">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50">
                                <ShoppingBag className="h-6 w-6 text-purple-600" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                Your Cart
                            </h1>
                        </div>

                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-4xl border border-slate-200/60 bg-white/80 p-12 py-24 text-center shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
                                    <ShoppingCart className="h-10 w-10 text-indigo-300" />
                                </div>
                                <h2 className="mb-3 text-2xl font-black text-slate-900">
                                    Your cart is empty
                                </h2>
                                <p className="mb-8 max-w-md text-slate-500">
                                    Looks like you haven't added any digital
                                    products yet. Let's find something awesome!
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                                >
                                    Start Browsing{' '}
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                                {/* LEFT COLUMN: Cart Items */}
                                <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                                    <ul className="divide-y divide-slate-100">
                                        {items.map((item) => (
                                            <li
                                                key={item.id}
                                                className={`group flex flex-col p-6 transition-colors sm:flex-row sm:p-8 ${item.has_pending_order ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}`}
                                            >
                                                <div className="mb-4 h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:mb-0 sm:h-28 sm:w-28">
                                                    <CartItemThumbnail
                                                        product={item.product}
                                                    />
                                                </div>

                                                <div className="flex flex-1 flex-col sm:ml-6">
                                                    <div className="flex flex-col justify-between sm:flex-row">
                                                        <div>
                                                            <Link
                                                                href={`/products/${item.product.slug}`}
                                                                className="text-xl font-black text-slate-900 hover:text-purple-700"
                                                            >
                                                                {
                                                                    item.product
                                                                        .title
                                                                }
                                                            </Link>

                                                            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-500">
                                                                By{' '}
                                                                <Link
                                                                    href={`/creators/@${item.product.seller.username}`}
                                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
                                                                >
                                                                    <span>
                                                                        {
                                                                            item
                                                                                .product
                                                                                .seller
                                                                                .name
                                                                        }
                                                                    </span>
                                                                    {item
                                                                        .product
                                                                        .seller
                                                                        .username && (
                                                                        <span className="text-[10px] text-slate-400">
                                                                            (@
                                                                            {
                                                                                item
                                                                                    .product
                                                                                    .seller
                                                                                    .username
                                                                            }
                                                                            )
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            </p>
                                                        </div>

                                                        {/* Discount Info */}
                                                        <div className="mt-2 flex flex-col items-start sm:mt-0 sm:items-end">
                                                            {item.product
                                                                .is_discount_active &&
                                                            item.product
                                                                .discount_price !==
                                                                undefined ? (
                                                                <>
                                                                    <span className="text-sm font-semibold text-slate-400 line-through">
                                                                        {formatCurrency(
                                                                            item
                                                                                .product
                                                                                .price,
                                                                        )}
                                                                    </span>
                                                                    <div className="text-xl font-black text-rose-600">
                                                                        {formatCurrency(
                                                                            item
                                                                                .product
                                                                                .discount_price,
                                                                        )}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-xl font-black text-emerald-600">
                                                                    {formatCurrency(
                                                                        item
                                                                            .product
                                                                            .price,
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto flex flex-1 items-end justify-between pt-4 text-sm">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {item.has_purchased_order && (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/20 ring-inset">
                                                                    <Package
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    Already
                                                                    Owned
                                                                    (Please
                                                                    Remove)
                                                                </span>
                                                            )}

                                                            {item.has_pending_order &&
                                                                !item.has_purchased_order && (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-500/20 ring-inset">
                                                                        <AlertTriangle
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                        Pending
                                                                        Order
                                                                        (Please
                                                                        Remove)
                                                                    </span>
                                                                )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                promptRemoveItem(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-bold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                        >
                                                            <Trash2 size={16} />
                                                            <span>Remove</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* RIGHT COLUMN: Order Summary */}
                                <div className="w-full shrink-0 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-xl shadow-purple-900/5 backdrop-blur-sm sm:p-8 lg:sticky lg:top-28 lg:w-100">
                                    <h2 className="mb-6 text-xl font-black text-slate-900">
                                        Order Summary
                                    </h2>

                                    <div className="space-y-4 text-slate-600">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span>
                                                Subtotal ({items.length} items)
                                            </span>
                                            <span className="text-slate-900">
                                                {formatCurrency(subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span>Taxes</span>
                                            <span className="text-slate-500">
                                                Calculated at checkout
                                            </span>
                                        </div>

                                        <div className="my-6 border-t border-slate-100 pt-6">
                                            <div className="flex items-end justify-between">
                                                <span className="text-base font-bold text-slate-900">
                                                    Total
                                                </span>
                                                <span className="text-3xl font-black text-slate-900">
                                                    {formatCurrency(subtotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- UPDATED: Button dynamically blocks checkout and prompts action --- */}
                                    <button
                                        onClick={handleCheckout}
                                        disabled={
                                            isCheckingOut || isCheckoutBlocked
                                        }
                                        className={`mt-8 flex w-full items-center justify-center rounded-xl px-6 py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed ${
                                            isCheckoutBlocked
                                                ? 'bg-amber-500 text-white hover:bg-amber-500'
                                                : 'bg-slate-900 hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:hover:translate-y-0'
                                        }`}
                                    >
                                        {isCheckingOut ? (
                                            <Spinner className="mr-2 h-5 w-5" />
                                        ) : null}
                                        {isCheckingOut
                                            ? 'Processing...'
                                            : hasPurchasedItems
                                              ? 'Remove Owned Items to Continue'
                                              : hasPendingItems
                                                ? 'Remove Pending Items to Continue'
                                                : 'Proceed to Payment'}
                                    </button>

                                    <div className="mt-6 text-center text-sm font-semibold text-slate-500">
                                        or{' '}
                                        <Link
                                            href="/"
                                            className="text-indigo-600 hover:text-indigo-700 hover:underline"
                                        >
                                            continue shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <ConfirmModal
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmRemoveItem}
                title="Remove Product"
                message="Are you sure you want to remove this digital product from your cart?"
                variant="danger"
                isProcessing={isProcessing}
            />
        </>
    );
}
