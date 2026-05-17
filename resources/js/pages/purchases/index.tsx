import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Package,
    PackageX,
    Download,
    Calendar,
    History,
    Search,
    ChevronDown,
    Clock,
    AlertCircle,
    ChevronRight,
    Receipt,
    XCircle,
    Timer,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
import { Spinner } from '@/components/ui/spinner';

// --- FIXED: Real-time Countdown Timer Component ---
function OrderCountdown({ createdAt }: { createdAt: string }) {
    // 1. Initialize the state correctly on the first render to avoid the sync setState warning
    const [timeInfo, setTimeInfo] = useState(() => {
        const createdTime = new Date(createdAt).getTime();
        const expirationTime = createdTime + 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const difference = expirationTime - now;

        if (difference <= 0) return { text: 'Expired', isExpired: true };

        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return {
            text: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            isExpired: false,
        };
    });

    useEffect(() => {
        if (timeInfo.isExpired) return;

        // 2. Only run the interval asynchronously
        const timer = setInterval(() => {
            const createdTime = new Date(createdAt).getTime();
            const expirationTime = createdTime + 24 * 60 * 60 * 1000;
            const now = new Date().getTime();
            const difference = expirationTime - now;

            if (difference <= 0) {
                setTimeInfo({ text: 'Expired', isExpired: true });
                clearInterval(timer);

                return;
            }

            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeInfo({
                text: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                isExpired: false,
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [createdAt, timeInfo.isExpired]);

    if (!timeInfo.text) return null;

    return (
        <span
            className={`mt-1 flex items-center gap-1.5 text-xs font-bold ${
                timeInfo.isExpired ? 'text-rose-500' : 'text-amber-600'
            }`}
        >
            <Timer size={14} />
            {timeInfo.isExpired
                ? 'Payment Time Expired'
                : `Expires in ${timeInfo.text}`}
        </span>
    );
}

// --- Isolated Thumbnail for Pending Orders ---
function PendingItemThumbnail({ item }: { item: any }) {
    const hasMedia = item.product?.media && item.product.media.length > 0;
    const [mediaStatus, setMediaStatus] = useState<
        'loading' | 'loaded' | 'error'
    >(hasMedia ? 'loading' : 'loaded');

    return (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
            {mediaStatus === 'loading' && (
                <Spinner className="absolute inset-0 m-auto h-4 w-4 animate-spin text-slate-400" />
            )}
            {mediaStatus === 'error' && (
                <Package className="absolute inset-0 m-auto h-5 w-5 text-slate-300" />
            )}
            {hasMedia ? (
                item.product.media[0].file_type === 'video' ? (
                    <video
                        src={`/storage/${item.product.media[0].file_path}#t=0.1`}
                        className={`pointer-events-none h-full w-full object-cover transition-opacity duration-300 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedData={() => setMediaStatus('loaded')}
                        onError={() => setMediaStatus('error')}
                    />
                ) : (
                    <img
                        src={`/storage/${item.product.media[0].file_path}`}
                        alt=""
                        className={`h-full w-full object-cover transition-opacity duration-300 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setMediaStatus('loaded')}
                        onError={() => setMediaStatus('error')}
                    />
                )
            ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Package size={16} />
                </div>
            )}
        </div>
    );
}

// --- Isolated Card for My Collection ---
function PurchaseCard({ transaction }: { transaction: any }) {
    const product = transaction.product;

    const isArchived = !product || !!product.deleted_at;
    const isHidden = product && !product.is_active;
    const isLocked = product && product.is_locked;
    const isPageUnavailable = isArchived || isHidden || isLocked;

    const hasMedia = product?.media && product.media.length > 0;
    const [mediaStatus, setMediaStatus] = useState<
        'loading' | 'loaded' | 'error'
    >(hasMedia && !isArchived ? 'loading' : 'loaded');

    return (
        <div
            className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${isArchived ? 'bg-slate-50 opacity-90 hover:border-slate-300 hover:shadow-slate-900/5' : 'bg-white hover:border-purple-200 hover:shadow-purple-900/5'}`}
        >
            {/* --- SMART MEDIA AREA --- */}
            <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100 p-6">
                {isArchived ? (
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-slate-200/50 text-slate-400">
                        <PackageX size={40} className="mb-2 opacity-50" />
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-70">
                            Archived
                        </span>
                    </div>
                ) : (
                    <>
                        {mediaStatus === 'loading' && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/50 backdrop-blur-sm">
                                <Spinner className="h-8 w-8 animate-spin text-purple-400" />
                            </div>
                        )}
                        {mediaStatus === 'error' && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-purple-300">
                                <Package className="mb-2 h-8 w-8 opacity-50" />
                                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase opacity-70">
                                    Media Failed to Load
                                </span>
                            </div>
                        )}
                        {hasMedia ? (
                            product.media[0].file_type === 'video' ? (
                                <div className="relative h-full w-full">
                                    <video
                                        src={`/storage/${product.media[0].file_path}#t=0.1`}
                                        className={`pointer-events-none h-full w-full rounded-lg object-cover shadow-sm transition-all duration-500 group-hover:scale-105 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                        muted
                                        playsInline
                                        preload="metadata"
                                        onLoadedData={() =>
                                            setMediaStatus('loaded')
                                        }
                                        onError={() => setMediaStatus('error')}
                                    />
                                </div>
                            ) : (
                                <img
                                    src={`/storage/${product.media[0].file_path}`}
                                    alt={product.title}
                                    className={`h-full w-full rounded-lg object-cover shadow-sm transition-all duration-500 group-hover:scale-105 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setMediaStatus('loaded')}
                                    onError={() => setMediaStatus('error')}
                                />
                            )
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-linear-to-br from-indigo-50 to-purple-100 text-purple-300">
                                <Package size={48} />
                            </div>
                        )}
                    </>
                )}
                <div className="absolute top-4 left-4 z-20 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-wider text-purple-600 uppercase shadow-sm ring-1 ring-black/5 backdrop-blur-md">
                    {product?.category?.name || 'Digital'}
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div
                className={`flex grow flex-col p-6 ${isArchived ? 'bg-slate-50' : 'bg-white'}`}
            >
                <h3
                    className={`mb-1.5 line-clamp-1 text-lg font-bold transition-colors ${isArchived ? 'text-slate-600' : 'text-slate-900 group-hover:text-purple-600'}`}
                >
                    {product?.title || 'Archived Product'}
                </h3>

                <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <span className="shrink-0">Creator:</span>
                    {product?.seller ? (
                        <Link
                            href={`/creators/@${product.seller.username}`}
                            className="flex min-w-0 items-center gap-1.5"
                        >
                            <span
                                className={`truncate ${isArchived ? 'text-slate-500' : 'text-indigo-600 hover:text-indigo-800 hover:underline'}`}
                            >
                                {product.seller.name}
                            </span>
                            <span className="truncate text-xs font-medium text-slate-400 hover:no-underline">
                                (@{product.seller.username})
                            </span>
                        </Link>
                    ) : (
                        <span className="truncate text-slate-400">
                            Deleted Account
                        </span>
                    )}
                </div>

                <div className="mb-6 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <Calendar size={12} />
                    Acquired:{' '}
                    {new Date(transaction.created_at).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' },
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4">
                    {!product ? (
                        <button
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-sm font-bold text-rose-500"
                        >
                            <PackageX size={16} />
                            File No Longer in Database
                        </button>
                    ) : (
                        <a
                            href={`/products/${product.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all ${isArchived ? 'bg-slate-800 hover:bg-slate-900 hover:shadow-md hover:shadow-slate-900/20' : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-500/20'}`}
                        >
                            <Download size={16} />
                            {isArchived ? 'Download Archive' : 'Download File'}
                        </a>
                    )}

                    {isPageUnavailable ? (
                        <button
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200/50 py-3 text-sm font-bold text-slate-400"
                        >
                            {isArchived
                                ? 'Store Page Unavailable'
                                : isLocked
                                  ? 'Product Suspended'
                                  : 'Product Hidden'}
                        </button>
                    ) : (
                        <Link
                            href={`/products/${product?.slug}`}
                            className="hover:purple-50 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-bold text-slate-600 transition-colors hover:text-purple-700"
                        >
                            View Product Page
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PurchasesIndex({
    transactions,
    pendingOrders,
    filters,
}: any) {
    const { flash } = usePage<any>().props;

    useEffect(() => {
        if (flash?.error) {
            toast(flash.error, 'error');
        }

        if (flash?.success) {
            toast(flash.success, 'success');
        }

        if (flash?.info) {
            toast(flash.info, 'info');
        }
    }, [flash]);

    const [search, setSearch] = useState(filters?.search || '');
    const [sort, setSort] = useState(filters?.sort || 'newest');

    const [isProcessing, setIsProcessing] = useState(false);

    const [cancelModalConfig, setCancelModalConfig] = useState<{
        isOpen: boolean;
        orderId: number | null;
    }>({
        isOpen: false,
        orderId: null,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/purchases',
            { search, sort },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const promptCancel = (id: number) => {
        setCancelModalConfig({ isOpen: true, orderId: id });
    };

    const executeCancel = () => {
        if (!cancelModalConfig.orderId) return;

        setIsProcessing(true);

        router.patch(
            `/orders/${cancelModalConfig.orderId}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCancelModalConfig({ isOpen: false, orderId: null });
                    toast('Order cancelled successfully.', 'info');
                },
                onError: () => {
                    setCancelModalConfig({ isOpen: false, orderId: null });
                    toast('Failed to cancel order.', 'error');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title="My Purchases - Soko" />
            <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                <Navbar />

                <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                    <div className="mb-16 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold tracking-wider text-indigo-600 uppercase ring-1 ring-indigo-500/10 ring-inset">
                            Buyer Dashboard
                        </div>
                        <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            Your Digital{' '}
                            <span className="bg-linear-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                                Purchases
                            </span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500 sm:text-xl">
                            Manage your payments and access your downloaded
                            products.
                        </p>
                    </div>

                    {/* ========================================================= */}
                    {/* SECTION 1: PENDING PAYMENTS                              */}
                    {/* ========================================================= */}
                    {pendingOrders && pendingOrders.length > 0 && (
                        <div className="mb-20">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm ring-1 ring-amber-200">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                        Action Required
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500">
                                        Please complete the payment to unlock
                                        your files.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {pendingOrders.map((order: any) => (
                                    <div
                                        key={order.id}
                                        className={`overflow-hidden rounded-3xl border bg-white shadow-xl ring-1 ${
                                            order.status === 'cancelled'
                                                ? 'border-slate-200/60 opacity-75 shadow-slate-900/5 ring-slate-100'
                                                : 'border-amber-200/60 shadow-amber-900/5 ring-amber-50'
                                        }`}
                                    >
                                        <div
                                            className={`flex flex-col justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-center ${
                                                order.status === 'verifying'
                                                    ? 'bg-amber-50/20'
                                                    : order.status ===
                                                        'cancelled'
                                                      ? 'bg-slate-50/50'
                                                      : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <div className="mb-4 flex items-center gap-4">
                                                    <span
                                                        className={`font-mono text-xs font-bold tracking-tighter uppercase ${order.status === 'cancelled' ? 'text-slate-300' : 'text-slate-400'}`}
                                                    >
                                                        Order #{order.id}
                                                    </span>

                                                    {order.status ===
                                                    'verifying' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                                                            <Clock size={10} />{' '}
                                                            Verifying Receipt
                                                        </span>
                                                    ) : order.status ===
                                                      'cancelled' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                                            <XCircle
                                                                size={10}
                                                            />{' '}
                                                            Cancelled
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                                                            <AlertCircle
                                                                size={10}
                                                            />{' '}
                                                            Awaiting Payment
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    {order.items?.map(
                                                        (
                                                            item: any,
                                                            idx: number,
                                                        ) => (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-start gap-3 ${order.status === 'cancelled' ? 'opacity-75 grayscale' : ''}`}
                                                            >
                                                                <Link
                                                                    href={
                                                                        item
                                                                            .product
                                                                            ?.slug
                                                                            ? `/products/${item.product.slug}`
                                                                            : '#'
                                                                    }
                                                                    className={`shrink-0 ${!item.product?.slug || order.status === 'cancelled' ? 'pointer-events-none' : ''}`}
                                                                >
                                                                    <PendingItemThumbnail
                                                                        item={
                                                                            item
                                                                        }
                                                                    />
                                                                </Link>

                                                                <div className="flex min-w-0 flex-col">
                                                                    {item
                                                                        .product
                                                                        ?.slug &&
                                                                    order.status !==
                                                                        'cancelled' ? (
                                                                        <Link
                                                                            href={`/products/${item.product.slug}`}
                                                                            className="line-clamp-1 text-sm font-bold text-slate-700 transition-colors hover:text-purple-600"
                                                                        >
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </Link>
                                                                    ) : (
                                                                        <span
                                                                            className={`line-clamp-1 text-sm font-bold ${order.status === 'cancelled' ? 'text-slate-500 line-through' : 'text-slate-700'}`}
                                                                        >
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </span>
                                                                    )}

                                                                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                                                        <span className="shrink-0 font-medium">
                                                                            Creator:
                                                                        </span>
                                                                        {item
                                                                            .product
                                                                            ?.seller ? (
                                                                            <Link
                                                                                href={`/creators/@${item.product.seller.username}`}
                                                                                className={`flex min-w-0 items-center gap-1.5 transition-colors ${order.status === 'cancelled' ? 'pointer-events-none' : ''}`}
                                                                            >
                                                                                <span
                                                                                    className={`truncate ${order.status === 'cancelled' ? 'text-slate-500' : 'text-indigo-600 hover:text-indigo-800 hover:underline'}`}
                                                                                >
                                                                                    {
                                                                                        item
                                                                                            .product
                                                                                            .seller
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                                <span className="truncate text-xs font-medium text-slate-400 hover:no-underline">
                                                                                    (@
                                                                                    {
                                                                                        item
                                                                                            .product
                                                                                            .seller
                                                                                            .username
                                                                                    }

                                                                                    )
                                                                                </span>
                                                                            </Link>
                                                                        ) : (
                                                                            <span className="truncate text-slate-400 italic">
                                                                                Deleted
                                                                                Account
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* --- ADDED: The React Countdown Component displays here! --- */}
                                                                    {order.status ===
                                                                        'pending' &&
                                                                        order.created_at && (
                                                                            <OrderCountdown
                                                                                createdAt={
                                                                                    order.created_at
                                                                                }
                                                                            />
                                                                        )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center gap-6 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between lg:flex-col lg:justify-center lg:border-t-0 lg:border-l lg:border-slate-100 lg:pt-0 lg:pl-8">
                                                <div className="text-center sm:text-left lg:text-center">
                                                    <p
                                                        className={`mb-1 text-xs font-bold tracking-widest uppercase ${order.status === 'cancelled' ? 'text-slate-300' : 'text-slate-400'}`}
                                                    >
                                                        Total Due
                                                    </p>
                                                    <p
                                                        className={`text-3xl font-black ${order.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-slate-900'}`}
                                                    >
                                                        {formatCurrency(
                                                            order.total_amount,
                                                        )}
                                                    </p>
                                                </div>

                                                {order.status ===
                                                'cancelled' ? (
                                                    <div className="w-full cursor-not-allowed rounded-2xl bg-slate-100 px-8 py-4 text-center text-sm font-bold text-slate-400 sm:w-auto">
                                                        Order Closed
                                                    </div>
                                                ) : (
                                                    <div className="flex w-full flex-col gap-2 sm:w-auto">
                                                        <Link
                                                            href={`/orders/${order.id}/pay`}
                                                            className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-500/25 sm:w-auto`}
                                                        >
                                                            Continue Payment
                                                            <ChevronRight
                                                                size={18}
                                                            />
                                                        </Link>

                                                        <button
                                                            onClick={() =>
                                                                promptCancel(
                                                                    order.id,
                                                                )
                                                            }
                                                            className="w-full rounded-xl px-4 py-3 text-xs font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                        >
                                                            Cancel / Change
                                                            Payment
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* SECTION 2: DIGITAL LIBRARY COLLECTION                     */}
                    {/* ========================================================= */}
                    <div>
                        <div className="mb-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-sm ring-1 ring-purple-200">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                        My Collection
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500">
                                        Successfully purchased files ready for
                                        download.
                                    </p>
                                </div>
                            </div>

                            {(transactions.data?.length > 0 ||
                                search !== '') && (
                                <form
                                    onSubmit={handleFilter}
                                    className="flex w-full flex-col gap-3 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200/60 sm:w-auto sm:flex-row sm:items-center"
                                >
                                    <div className="relative grow sm:w-64">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className="h-10 w-full rounded-xl border-none bg-transparent pr-4 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                                        />
                                    </div>
                                    <div className="hidden h-5 w-px bg-slate-200 sm:block"></div>
                                    <div className="relative shrink-0 sm:w-48">
                                        <select
                                            value={sort}
                                            onChange={(e) => {
                                                setSort(e.target.value);
                                                router.get(
                                                    '/purchases',
                                                    {
                                                        search,
                                                        sort: e.target.value,
                                                    },
                                                    {
                                                        preserveState: true,
                                                        replace: true,
                                                        preserveScroll: true,
                                                    },
                                                );
                                            }}
                                            className="h-10 w-full cursor-pointer appearance-none rounded-xl border-none bg-transparent px-4 pr-9 text-sm font-medium text-slate-600 focus:ring-0 focus:outline-none"
                                        >
                                            <option value="newest">
                                                Recently Purchased
                                            </option>
                                            <option value="oldest">
                                                Oldest Purchases
                                            </option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    <button
                                        type="submit"
                                        className="hidden"
                                        aria-label="Submit search"
                                    ></button>
                                </form>
                            )}
                        </div>

                        {transactions.data?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-4xl border border-slate-200/60 bg-white/50 py-24 text-center shadow-sm backdrop-blur-sm">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/50">
                                    <History className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-slate-900">
                                    {search
                                        ? 'No results found'
                                        : 'Your collection is empty'}
                                </h3>
                                <p className="mb-8 max-w-md text-slate-500">
                                    {search
                                        ? `We couldn't find anything matching "${search}".`
                                        : "You haven't completed any purchases yet. Once your orders are approved, your files will appear here."}
                                </p>
                                {!search && (
                                    <Link
                                        href="/"
                                        className="rounded-xl bg-slate-900 px-8 py-3.5 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                                    >
                                        Browse Marketplace
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {transactions.data?.map((transaction: any) => {
                                    return (
                                        <PurchaseCard
                                            key={transaction.id}
                                            transaction={transaction}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {transactions.links &&
                            transactions.links.length > 3 && (
                                <div className="mt-10 flex flex-wrap justify-center gap-2">
                                    {transactions.links.map(
                                        (link: any, index: number) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveScroll
                                                className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition-all ${link.active ? 'bg-slate-900 text-white shadow-md' : !link.url ? 'cursor-not-allowed bg-slate-100 text-slate-400 opacity-50' : 'bg-white text-slate-600 ring-1 ring-slate-200/60 hover:bg-slate-50'}`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ),
                                    )}
                                </div>
                            )}
                    </div>
                </main>
            </div>

            <ConfirmModal
                isOpen={cancelModalConfig.isOpen}
                onClose={() =>
                    setCancelModalConfig({ isOpen: false, orderId: null })
                }
                onConfirm={executeCancel}
                title="Cancel Order"
                message="Are you sure you want to cancel this order? This will void the current transaction so you can check out again with a different payment method. This action cannot be undone."
                confirmText="Yes, cancel it"
                variant="danger"
                isProcessing={isProcessing}
            />
        </>
    );
}
