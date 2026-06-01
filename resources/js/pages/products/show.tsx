import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import {
    ShoppingBag,
    Star,
    Download,
    Edit,
    Trash2,
    CheckCircle,
    AlertTriangle,
    PlayCircle,
    CreditCard,
    XCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import SimpleNavbar from '@/components/simple-navbar';
import { toast } from '@/components/toaster';
import { Spinner } from '@/components/ui/spinner';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

// --- Isolated Thumbnail Component for Product Gallery ---
function ProductThumbnail({
    item,
    isActive,
    onClick,
}: {
    item: any;
    isActive: boolean;
    onClick: () => void;
}) {
    const { t } = useTranslation();
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        'loading',
    );

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                isActive
                    ? 'border-purple-500 shadow-md ring-2 ring-purple-500/20'
                    : 'border-transparent opacity-70 hover:opacity-100'
            }`}
        >
            {/* 1. Loading State */}
            {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50">
                    <Spinner className="h-4 w-4 animate-spin text-slate-400" />
                </div>
            )}

            {/* 2. Error State */}
            {status === 'error' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                    <AlertTriangle size={16} className="mb-1 opacity-50" />
                    <span className="text-[8px] font-bold tracking-widest uppercase opacity-70">
                        {t('Error')}
                    </span>
                </div>
            )}

            {/* 3. Actual Media */}
            {item.file_type === 'video' ? (
                <>
                    <video
                        src={`/storage/${item.file_path}`}
                        className={`h-full w-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedData={() => setStatus('loaded')}
                        onError={() => setStatus('error')}
                    />
                    {status === 'loaded' && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/10">
                            <PlayCircle className="h-8 w-8 text-white/90 drop-shadow-md" />
                        </div>
                    )}
                </>
            ) : (
                <img
                    src={`/storage/${item.file_path}`}
                    alt="Thumbnail"
                    className={`h-full w-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            )}
        </button>
    );
}

export default function Show({
    product,
    hasPurchased,
    isInCart,
    pendingOrderId,
}: any) {
    const { t } = useTranslation();
    const { auth, flash } = usePage().props as any;

    const existingReview = product.reviews?.find(
        (r: any) =>
            r.user_id === auth?.user?.id || r.user?.id === auth?.user?.id,
    );

    const [isEditingReview, setIsEditingReview] = useState(false);

    const { data, setData, post, processing } = useForm({
        rating: existingReview ? existingReview.rating : 5,
        comment: existingReview ? existingReview.comment || '' : '',
    });

    const { post: submitPurchase, processing: isBuying } = useForm();

    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const hasMedia = product.media && product.media.length > 0;
    const [activeMedia, setActiveMedia] = useState(
        hasMedia ? product.media[0] : null,
    );

    const [mediaStatus, setMediaStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    // --- NEW: Cancel Order State ---
    const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
    const [isCancellingOrder, setIsCancellingOrder] = useState(false);

    // --- GLOBAL FLASH LISTENER ---
    useEffect(() => {
        if (flash?.success) toast(flash.success, 'success');

        if (flash?.error) toast(flash.error, 'error');

        if (flash?.info) toast(flash.info, 'info');

        if (flash?.success || flash?.error || flash?.info) {
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

    const executeDelete = () => {
        router.delete(`/seller/products/${product.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            },
        });
    };

    // --- NEW: Handle Order Cancellation ---
    const executeCancelOrder = () => {
        if (!pendingOrderId) return;

        setIsCancellingOrder(true);
        router.patch(
            `/orders/${pendingOrderId}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCancelOrderModalOpen(false);
                },
                onError: () => toast(t('Failed to cancel order.'), 'error'),
                onFinish: () => setIsCancellingOrder(false),
            },
        );
    };

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/products/${product.id}/reviews`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingReview(false);
            },
        });
    };

    const addToCart = () => {
        setIsAddingToCart(true);
        router.post(
            route('cart.store'),
            { product_id: product.id },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setIsAddingToCart(false),
            },
        );
    };

    const handleBuyItNow = () => {
        submitPurchase(`/products/${product.id}/checkout`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const isOwner = auth?.user?.id === product.seller_id;
    const isGuest = !auth?.user;
    const isAdmin = auth?.user?.role === 'admin';

    return (
        <>
            <Head title={`${product.title} - Soko`} />

            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                <SimpleNavbar />

                <main className="relative z-10 flex-1 pt-32 pb-24">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                            {/* LEFT COLUMN */}
                            <div className="flex w-full flex-col gap-8 lg:w-2/3">
                                {/* Product Info Bento Card */}
                                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-10">
                                    <div className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold tracking-wider text-indigo-600 uppercase ring-1 ring-indigo-500/10 ring-inset">
                                        {product.category?.name ||
                                            t('Digital Product')}
                                    </div>

                                    <h1 className="mb-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                        {product.title}
                                    </h1>

                                    {hasMedia && activeMedia && (
                                        <div className="mb-8">
                                            <div className="relative flex max-h-125 min-h-75 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-900 shadow-inner">
                                                {/* 1. MAIN LOADING STATE */}
                                                {mediaStatus === 'loading' && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Spinner className="h-8 w-8 animate-spin text-slate-500" />
                                                    </div>
                                                )}

                                                {/* 2. MAIN ERROR STATE */}
                                                {mediaStatus === 'error' && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="48"
                                                            height="48"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="mb-4 opacity-50"
                                                        >
                                                            <rect
                                                                width="18"
                                                                height="18"
                                                                x="3"
                                                                y="3"
                                                                rx="2"
                                                                ry="2"
                                                            />
                                                            <circle
                                                                cx="9"
                                                                cy="9"
                                                                r="2"
                                                            />
                                                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                                            <path d="m2 2 20 20" />
                                                        </svg>
                                                        <span className="text-xs font-bold tracking-widest uppercase opacity-70">
                                                            {t(
                                                                'Media Unavailable',
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* 3. ACTUAL MAIN MEDIA */}
                                                {activeMedia.file_type ===
                                                'video' ? (
                                                    <video
                                                        key={`video-${activeMedia.id}`}
                                                        src={`/storage/${activeMedia.file_path}`}
                                                        controls
                                                        className={`max-h-125 w-full object-contain transition-opacity duration-300 outline-none ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                                        onLoadedData={() =>
                                                            setMediaStatus(
                                                                'loaded',
                                                            )
                                                        }
                                                        onError={() =>
                                                            setMediaStatus(
                                                                'error',
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <img
                                                        key={`img-${activeMedia.id}`}
                                                        src={`/storage/${activeMedia.file_path}`}
                                                        alt={product.title}
                                                        className={`max-h-125 w-full object-contain transition-opacity duration-300 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                                        onLoad={() =>
                                                            setMediaStatus(
                                                                'loaded',
                                                            )
                                                        }
                                                        onError={() =>
                                                            setMediaStatus(
                                                                'error',
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>

                                            {/* --- SMART THUMBNAILS CAROUSEL --- */}
                                            {product.media.length > 1 && (
                                                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                                    {product.media.map(
                                                        (item: any) => (
                                                            <ProductThumbnail
                                                                key={item.id}
                                                                item={item}
                                                                isActive={
                                                                    activeMedia.id ===
                                                                    item.id
                                                                }
                                                                onClick={() => {
                                                                    setActiveMedia(
                                                                        item,
                                                                    );
                                                                    setMediaStatus(
                                                                        'loading',
                                                                    );
                                                                }}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="prose prose-slate max-w-none text-slate-600">
                                        <p className="leading-relaxed whitespace-pre-wrap">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Reviews Bento Card */}
                                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-10">
                                    <h2 className="mb-8 text-2xl font-black tracking-tight text-slate-900">
                                        {t('Customer Reviews')}
                                    </h2>

                                    {!isGuest &&
                                        !isOwner &&
                                        !isAdmin &&
                                        hasPurchased &&
                                        (!existingReview ||
                                            isEditingReview) && (
                                            <form
                                                onSubmit={submitReview}
                                                className={`mb-10 rounded-2xl border p-6 shadow-inner ${
                                                    existingReview
                                                        ? 'border-emerald-100 bg-emerald-50/50'
                                                        : 'border-purple-100 bg-purple-50/50'
                                                }`}
                                            >
                                                <div className="mb-5 flex items-center justify-between">
                                                    <h3 className="text-lg font-bold text-slate-900">
                                                        {existingReview
                                                            ? t(
                                                                  'Update your review',
                                                              )
                                                            : t(
                                                                  'Leave your feedback',
                                                              )}
                                                    </h3>
                                                </div>

                                                <div className="mb-6">
                                                    <label className="mb-3 block text-sm font-bold text-slate-700">
                                                        {t('Rating')}
                                                    </label>

                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <button
                                                                    type="button"
                                                                    key={star}
                                                                    onMouseEnter={() =>
                                                                        setHoverRating(
                                                                            star,
                                                                        )
                                                                    }
                                                                    onMouseLeave={() =>
                                                                        setHoverRating(
                                                                            0,
                                                                        )
                                                                    }
                                                                    onClick={() =>
                                                                        setData(
                                                                            'rating',
                                                                            star,
                                                                        )
                                                                    }
                                                                    className="focus:outline-none"
                                                                >
                                                                    <Star
                                                                        size={
                                                                            32
                                                                        }
                                                                        className={`transition-all duration-200 ${
                                                                            (hoverRating ||
                                                                                data.rating) >=
                                                                            star
                                                                                ? 'scale-110 fill-amber-400 text-amber-400 drop-shadow-sm'
                                                                                : 'fill-slate-200 text-slate-200 hover:scale-110'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mb-5">
                                                    <label className="mb-2 block text-sm font-bold text-slate-700">
                                                        {t(
                                                            'Comment (Optional)',
                                                        )}
                                                    </label>
                                                    <textarea
                                                        value={data.comment}
                                                        onChange={(e) =>
                                                            setData(
                                                                'comment',
                                                                e.target.value,
                                                            )
                                                        }
                                                        rows={3}
                                                        className={`w-full resize-none rounded-xl border bg-white px-4 py-3 shadow-sm focus:ring-1 focus:outline-none ${
                                                            existingReview
                                                                ? 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400'
                                                                : 'border-slate-200 focus:border-purple-400 focus:ring-purple-400'
                                                        }`}
                                                        placeholder={t(
                                                            'What did you think of this product?',
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className={`rounded-xl px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 ${
                                                            existingReview
                                                                ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/25'
                                                                : 'bg-slate-900 hover:bg-purple-600 hover:shadow-purple-500/25'
                                                        }`}
                                                    >
                                                        {existingReview
                                                            ? t('Update Review')
                                                            : t(
                                                                  'Submit Review',
                                                              )}
                                                    </button>

                                                    {existingReview && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setIsEditingReview(
                                                                    false,
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-300 disabled:opacity-50"
                                                        >
                                                            {t('Cancel')}
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        )}

                                    <div className="space-y-6">
                                        {!product.reviews ||
                                        product.reviews.length === 0 ? (
                                            <div className="rounded-xl border border-slate-100 bg-slate-50 py-10 text-center text-slate-500">
                                                <Star className="mx-auto mb-3 h-10 w-10 fill-slate-200 text-slate-200" />
                                                <p className="font-medium text-slate-600">
                                                    {t('No reviews yet.')}
                                                </p>
                                                <p className="text-sm">
                                                    {t(
                                                        'Be the first to review!',
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            product.reviews.map(
                                                (review: any) => {
                                                    const isMyReview =
                                                        review.user?.id ===
                                                        auth?.user?.id;

                                                    return (
                                                        <div
                                                            key={review.id}
                                                            className={`border-b border-slate-100 pb-6 last:border-0 last:pb-0 ${isMyReview && isEditingReview ? 'hidden' : 'block'}`}
                                                        >
                                                            <div className="mb-3 flex items-start justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-tr from-indigo-100 to-purple-100 font-bold text-purple-700 ring-2 ring-white">
                                                                        {review.user?.name
                                                                            ?.charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 font-bold text-slate-900">
                                                                            {
                                                                                review
                                                                                    .user
                                                                                    ?.name
                                                                            }
                                                                            {isMyReview && (
                                                                                <span className="shrink-0 rounded-md bg-purple-100 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-purple-700 uppercase ring-1 ring-purple-500/20 ring-inset">
                                                                                    {t(
                                                                                        'You',
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-1 flex gap-0.5">
                                                                            {[
                                                                                ...Array(
                                                                                    5,
                                                                                ),
                                                                            ].map(
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) => (
                                                                                    <Star
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                        className={
                                                                                            i <
                                                                                            review.rating
                                                                                                ? 'fill-amber-400 text-amber-400'
                                                                                                : 'fill-slate-100 text-slate-200'
                                                                                        }
                                                                                    />
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {isMyReview && (
                                                                    <button
                                                                        onClick={() =>
                                                                            setIsEditingReview(
                                                                                true,
                                                                            )
                                                                        }
                                                                        className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                                                    >
                                                                        <Edit
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                        {t(
                                                                            'Edit',
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {review.comment && (
                                                                <p className="ml-16 leading-relaxed text-slate-600">
                                                                    {
                                                                        review.comment
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Sticky Purchasing Block */}
                            <div className="w-full lg:sticky lg:top-28 lg:w-1/3">
                                {isOwner && product.is_locked && (
                                    <div className="mb-6 overflow-hidden rounded-[20px] border border-rose-200 bg-rose-50 p-5 shadow-sm">
                                        <div className="mb-2 flex items-center gap-2 font-black text-rose-700">
                                            <AlertTriangle size={20} />
                                            {t('Disabled by Administrator')}
                                        </div>
                                        <p className="text-sm leading-relaxed font-medium text-rose-600">
                                            {t(
                                                'This product has been locked and removed from the public marketplace due to a policy violation or review. You can edit the product to fix issues, or delete it entirely.',
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-8">
                                    <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-inner">
                                        {product.is_discount_active ? (
                                            <div>
                                                <div className="mb-2 flex items-center gap-3">
                                                    <span className="text-lg font-semibold text-slate-400 line-through">
                                                        Rp{' '}
                                                        {Number(
                                                            product.price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-600">
                                                        {t('SALE')}
                                                    </span>
                                                </div>
                                                <div className="text-4xl font-black text-rose-600">
                                                    Rp{' '}
                                                    {Number(
                                                        product.discount_price,
                                                    ).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-4xl font-black text-emerald-600">
                                                Rp{' '}
                                                {Number(
                                                    product.price,
                                                ).toLocaleString('id-ID')}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-8 space-y-3 text-sm">
                                        <div className="flex items-start justify-between gap-4 text-slate-600">
                                            <span className="shrink-0 font-semibold">
                                                {t('Creator:')}
                                            </span>
                                            <div className="flex min-w-0 flex-col items-end">
                                                <div className="flex max-w-full items-center gap-2">
                                                    <Link
                                                        href={`/creators/@${product.seller?.username}`}
                                                        className="truncate font-bold text-indigo-600 transition-colors hover:text-indigo-800 hover:underline"
                                                        title={
                                                            product.seller?.name
                                                        }
                                                    >
                                                        {product.seller?.name ||
                                                            t('Unknown')}
                                                    </Link>

                                                    {isOwner && (
                                                        <span className="shrink-0 rounded-md bg-purple-100 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-purple-700 uppercase ring-1 ring-purple-500/20 ring-inset">
                                                            {t('You')}
                                                        </span>
                                                    )}
                                                </div>

                                                {product.seller?.username && (
                                                    <span className="mt-0.5 w-full truncate text-right text-xs font-medium text-slate-400">
                                                        @
                                                        {
                                                            product.seller
                                                                .username
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-1 text-slate-600">
                                            <span className="font-semibold">
                                                {t('Status:')}
                                            </span>
                                            <span
                                                className={
                                                    product.is_locked
                                                        ? 'font-bold text-rose-600'
                                                        : product.is_active
                                                          ? 'font-medium text-emerald-600'
                                                          : 'font-medium text-amber-600'
                                                }
                                            >
                                                {product.is_locked
                                                    ? t('Suspended')
                                                    : product.is_active
                                                      ? t('Available')
                                                      : t('Hidden')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {isAdmin ? (
                                            <div className="flex h-14 items-center justify-center rounded-xl bg-slate-100 px-4 font-bold text-slate-500 shadow-inner">
                                                {t('Viewing as Administrator')}
                                            </div>
                                        ) : isOwner ? (
                                            <>
                                                <div className="flex h-12 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-500 shadow-inner">
                                                    {t('You own this product')}
                                                </div>
                                                <a
                                                    href={`/products/${product.id}/download`}
                                                    className="flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-500 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25"
                                                >
                                                    <Download size={20} />
                                                    {t('Download Source File')}
                                                </a>
                                            </>
                                        ) : hasPurchased ? (
                                            <a
                                                href={`/products/${product.id}/download`}
                                                className="flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-500 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25"
                                            >
                                                <Download size={20} />
                                                {t('Download File')}
                                            </a>
                                        ) : isGuest ? (
                                            <Link
                                                href={route('login')}
                                                className="flex h-14 items-center justify-center rounded-xl bg-slate-900 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                                            >
                                                {t('Log in to Purchase')}
                                            </Link>
                                        ) : product.is_active &&
                                          !product.is_locked ? (
                                            pendingOrderId ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-700 ring-1 ring-amber-500/20 ring-inset">
                                                        <AlertTriangle
                                                            size={18}
                                                            className="mt-0.5 shrink-0"
                                                        />
                                                        <p className="leading-relaxed">
                                                            {t(
                                                                'Looks like you have an unpaid order for this product.',
                                                            )}
                                                        </p>
                                                    </div>

                                                    <Link
                                                        href={`/orders/${pendingOrderId}/pay`}
                                                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                                                    >
                                                        <CreditCard size={18} />
                                                        {t('Continue Payment')}
                                                    </Link>

                                                    <button
                                                        onClick={() =>
                                                            setIsCancelOrderModalOpen(
                                                                true,
                                                            )
                                                        }
                                                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                    >
                                                        <XCircle size={18} />
                                                        {t(
                                                            'Cancel / Change Method',
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {isInCart ? (
                                                        <Link
                                                            href="/cart"
                                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-8 py-4 font-bold text-emerald-600 ring-1 ring-emerald-200 transition-all ring-inset hover:bg-emerald-100 hover:text-emerald-700 sm:w-auto"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                            {t(
                                                                'Already in Cart (View)',
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            onClick={addToCart}
                                                            disabled={
                                                                isAddingToCart
                                                            }
                                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
                                                        >
                                                            {isAddingToCart ? (
                                                                <Spinner className="h-5 w-5" />
                                                            ) : (
                                                                <ShoppingBag className="h-5 w-5" />
                                                            )}
                                                            {isAddingToCart
                                                                ? t('Adding...')
                                                                : t(
                                                                      'Add to Cart',
                                                                  )}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleBuyItNow}
                                                        disabled={isBuying}
                                                        className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-slate-900 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                                    >
                                                        {isBuying ? (
                                                            <Spinner className="mr-2 h-5 w-5" />
                                                        ) : null}
                                                        {isBuying
                                                            ? t('Processing...')
                                                            : t('Buy It Now')}
                                                    </button>
                                                </>
                                            )
                                        ) : (
                                            <button
                                                disabled
                                                className="flex h-14 cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 font-bold text-slate-400"
                                            >
                                                {t('Currently Unavailable')}
                                            </button>
                                        )}
                                    </div>

                                    {isOwner && (
                                        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
                                            <Link
                                                href={`/seller/products/${product.id}/edit`}
                                                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-50 font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                                            >
                                                <Edit size={18} />
                                                {t('Edit Product')}
                                            </Link>

                                            <button
                                                onClick={() =>
                                                    setIsDeleteModalOpen(true)
                                                }
                                                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-50 font-bold text-rose-600 transition-colors hover:bg-rose-100"
                                            >
                                                <Trash2 size={18} />
                                                {t('Delete Product')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeDelete}
                title={t('Delete Product')}
                message={t(
                    'Are you sure you want to permanently delete ":title"? This action cannot be undone and the file will be removed from the server.',
                ).replace(':title', product.title)}
                confirmText={t('Yes, delete it')}
                variant="danger"
            />

            <ConfirmModal
                isOpen={isCancelOrderModalOpen}
                onClose={() => setIsCancelOrderModalOpen(false)}
                onConfirm={executeCancelOrder}
                title={t('Cancel Pending Order')}
                message={t(
                    'Are you sure you want to cancel your pending order for this product? This will void the current transaction so you can check out again with a different payment method. This action cannot be undone.',
                )}
                confirmText={t('Yes, cancel order')}
                variant="danger"
                isProcessing={isCancellingOrder}
            />
        </>
    );
}
