import type { PageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Trash2,
    ShoppingBag,
    ArrowRight,
    ShoppingCart,
    Package,
    AlertTriangle,
    Check,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/useTranslation';

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
    has_pending_order?: boolean;
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
    const { t } = useTranslation();
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
            {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                    <Spinner className="h-5 w-5 animate-spin text-purple-400" />
                </div>
            )}
            {status === 'error' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-purple-300">
                    <Package className="mb-1 h-6 w-6 opacity-50" />
                    <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase opacity-70">
                        {t('Error')}
                    </span>
                </div>
            )}
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
    const { t } = useTranslation();
    const { flash } = usePage<any>().props;

    const items = useMemo(() => cart?.items || [], [cart?.items]);

    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // --- ADDED: State to track selected items ---
    // Secara default, semua item di keranjang dicentang
    const [selectedItems, setSelectedItems] = useState<number[]>(
        items.map((item) => item.id),
    );

    useEffect(() => {
        router.reload({ only: ['cart'] });
    }, []);

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

    // --- ADDED: Checkbox Toggle Handlers ---
    const toggleItemSelection = (id: number) => {
        setSelectedItems((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((item) => item.id));
        }
    };

    // --- UPDATED: Calculations only apply to selected items ---
    const activeItems = items.filter((item) => selectedItems.includes(item.id));

    const hasPendingItems = activeItems.some((item) => item.has_pending_order);
    const hasPurchasedItems = activeItems.some(
        (item) => item.has_purchased_order,
    );

    // Blokir checkout jika tidak ada item yang dipilih, atau jika item yang dipilih memiliki masalah
    const isCheckoutBlocked =
        hasPendingItems || hasPurchasedItems || selectedItems.length === 0;

    const getFinalPrice = (product: Product) => {
        return product.is_discount_active &&
            product.discount_price !== undefined
            ? product.discount_price
            : product.price;
    };

    const subtotal = activeItems.reduce(
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
                // PERBAIKAN: Bersihkan centang checkbox secara aman di sini saat sukses dihapus
                setSelectedItems((prev) =>
                    prev.filter((id) => id !== itemToDelete),
                );
                setItemToDelete(null);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    // --- UPDATED: Send selected_item_ids to the backend ---
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast(t('Please select at least one item to checkout.'), 'error');

            return;
        }

        setIsCheckingOut(true);

        router.post(
            route('checkout.process'),
            {
                selected_item_ids: selectedItems,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsCheckingOut(false),
            },
        );
    };

    return (
        <>
            <Head title={t('My Cart - Soko')} />

            <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                <Navbar />

                <main className="relative z-10 pt-32 pb-24">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50">
                                <ShoppingBag className="h-6 w-6 text-purple-600" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                {t('Your Cart')}
                            </h1>
                        </div>

                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-4xl border border-slate-200/60 bg-white/80 p-12 py-24 text-center shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
                                    <ShoppingCart className="h-10 w-10 text-indigo-300" />
                                </div>
                                <h2 className="mb-3 text-2xl font-black text-slate-900">
                                    {t('Your cart is empty')}
                                </h2>
                                <p className="mb-8 max-w-md text-slate-500">
                                    {t(
                                        "Looks like you haven't added any digital products yet. Let's find something awesome!",
                                    )}
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                                >
                                    {t('Start Browsing')}{' '}
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                                {/* LEFT COLUMN: Cart Items */}
                                <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                                    {/* --- ADDED: Select All Toolbar --- */}
                                    <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
                                        <button
                                            type="button"
                                            onClick={toggleSelectAll}
                                            className="group flex cursor-pointer items-center gap-3 outline-none"
                                        >
                                            <div
                                                className={`flex h-5 w-5 items-center justify-center rounded-[6px] border-2 transition-all duration-200 ${
                                                    selectedItems.length ===
                                                        items.length &&
                                                    items.length > 0
                                                        ? 'border-purple-600 bg-purple-600 text-white'
                                                        : 'border-slate-300 bg-white group-hover:border-purple-400'
                                                }`}
                                            >
                                                <Check
                                                    size={14}
                                                    strokeWidth={3}
                                                    className={
                                                        selectedItems.length ===
                                                            items.length &&
                                                        items.length > 0
                                                            ? 'scale-100 opacity-100 transition-all duration-300 ease-out'
                                                            : 'scale-50 opacity-0 transition-all duration-200 ease-in'
                                                    }
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-purple-700">
                                                {t('Select All')}
                                            </span>
                                        </button>
                                        <span className="text-xs font-medium text-slate-400">
                                            ({selectedItems.length} /{' '}
                                            {items.length} {t('selected')})
                                        </span>
                                    </div>

                                    <ul className="divide-y divide-slate-100">
                                        {items.map((item) => (
                                            <li
                                                key={item.id}
                                                className={`group flex flex-col p-6 transition-colors sm:flex-row sm:p-8 ${
                                                    item.has_pending_order
                                                        ? 'bg-amber-50/30'
                                                        : 'hover:bg-slate-50/50'
                                                }`}
                                            >
                                                {/* --- ADDED: Individual Checkbox --- */}
                                                <div className="mb-4 flex items-center sm:mb-0 sm:pr-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleItemSelection(
                                                                item.id,
                                                            )
                                                        }
                                                        className="group flex h-10 w-10 items-center justify-center rounded-full transition-colors outline-none hover:bg-purple-50 sm:h-auto sm:w-auto sm:hover:bg-transparent"
                                                    >
                                                        <div
                                                            className={`flex h-6 w-6 items-center justify-center rounded-[8px] border-2 transition-all duration-200 ${
                                                                selectedItems.includes(
                                                                    item.id,
                                                                )
                                                                    ? 'border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-500/30'
                                                                    : 'border-slate-300 bg-white group-hover:border-purple-400'
                                                            }`}
                                                        >
                                                            <Check
                                                                size={16}
                                                                strokeWidth={3}
                                                                className={
                                                                    selectedItems.includes(
                                                                        item.id,
                                                                    )
                                                                        ? 'scale-100 opacity-100 transition-all duration-300 ease-out'
                                                                        : 'scale-50 opacity-0 transition-all duration-200 ease-in'
                                                                }
                                                            />
                                                        </div>
                                                    </button>
                                                </div>

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
                                                                {t('By')}{' '}
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
                                                                    {t(
                                                                        'Already Owned (Please Remove)',
                                                                    )}
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
                                                                        {t(
                                                                            'Pending Order (Please Remove)',
                                                                        )}
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
                                                            <span>
                                                                {t('Remove')}
                                                            </span>
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
                                        {t('Order Summary')}
                                    </h2>

                                    <div className="space-y-4 text-slate-600">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span>
                                                {t('Subtotal')} (
                                                {selectedItems.length}{' '}
                                                {t('items')})
                                            </span>
                                            <span className="text-slate-900">
                                                {formatCurrency(subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span>{t('Taxes')}</span>
                                            <span className="text-slate-500">
                                                {t('Calculated at checkout')}
                                            </span>
                                        </div>

                                        <div className="my-6 border-t border-slate-100 pt-6">
                                            <div className="flex items-end justify-between">
                                                <span className="text-base font-bold text-slate-900">
                                                    {t('Total')}
                                                </span>
                                                <span className="text-3xl font-black text-slate-900">
                                                    {formatCurrency(subtotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- UPDATED: Checkout logic depends on selected items --- */}
                                    <button
                                        onClick={handleCheckout}
                                        disabled={
                                            isCheckingOut || isCheckoutBlocked
                                        }
                                        className={`mt-8 flex w-full items-center justify-center rounded-xl px-6 py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed ${
                                            isCheckoutBlocked
                                                ? selectedItems.length === 0
                                                    ? 'bg-slate-300 text-white'
                                                    : 'bg-amber-500 text-white hover:bg-amber-500'
                                                : 'bg-slate-900 hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:hover:translate-y-0'
                                        }`}
                                    >
                                        {isCheckingOut ? (
                                            <Spinner className="mr-2 h-5 w-5" />
                                        ) : null}
                                        {isCheckingOut
                                            ? t('Processing...')
                                            : selectedItems.length === 0
                                              ? t('Select an item to checkout')
                                              : hasPurchasedItems
                                                ? t(
                                                      'Uncheck Owned Items to Continue',
                                                  )
                                                : hasPendingItems
                                                  ? t(
                                                        'Uncheck Pending Items to Continue',
                                                    )
                                                  : t('Proceed to Payment')}
                                    </button>

                                    <div className="mt-6 text-center text-sm font-semibold text-slate-500">
                                        {t('or')}{' '}
                                        <Link
                                            href="/"
                                            className="text-indigo-600 hover:text-indigo-700 hover:underline"
                                        >
                                            {t('continue shopping')}
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
                title={t('Remove Product')}
                message={t(
                    'Are you sure you want to remove this digital product from your cart?',
                )}
                variant="danger"
                isProcessing={isProcessing}
            />
        </>
    );
}
