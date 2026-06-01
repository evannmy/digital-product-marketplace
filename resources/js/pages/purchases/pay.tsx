import { Head, router, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Package,
    CheckCircle2,
    ArrowRight,
    RefreshCcw,
    XCircle,
    PackageX,
    Timer,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import SimpleNavbar from '@/components/simple-navbar';
import { toast } from '@/components/toaster';
import { Spinner } from '@/components/ui/spinner';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

declare global {
    interface Window {
        snap: any;
    }
}

function OrderCountdown({ createdAt }: { createdAt: string }) {
    const { t } = useTranslation();

    // --- ADDED: Ambil flash dari Inertia ---
    const { flash } = usePage().props as any;

    // --- ADDED: Listener otomatis untuk Toast ---
    useEffect(() => {
        if (flash?.success) toast(flash.success, 'success');

        if (flash?.error) toast(flash.error, 'error');

        if (flash?.info) toast(flash.info, 'info');
    }, [flash]);

    const [timeInfo, setTimeInfo] = useState(() => {
        const createdTime = new Date(createdAt).getTime();
        const expirationTime = createdTime + 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const difference = expirationTime - now;

        if (difference <= 0) return { text: t('Expired'), isExpired: true };

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

        const timer = setInterval(() => {
            const createdTime = new Date(createdAt).getTime();
            const expirationTime = createdTime + 24 * 60 * 60 * 1000;
            const now = new Date().getTime();
            const difference = expirationTime - now;

            if (difference <= 0) {
                setTimeInfo({ text: t('Expired'), isExpired: true });
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
    }, [createdAt, timeInfo.isExpired, t]);

    if (!timeInfo.text) return null;

    return (
        <div
            className={`mt-4 flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-bold ${
                timeInfo.isExpired
                    ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 ring-inset'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 ring-inset'
            }`}
        >
            <Timer size={18} />
            {timeInfo.isExpired
                ? t('Payment Time Expired')
                : `${t('Complete payment in')} ${timeInfo.text}`}
        </div>
    );
}

function OrderItemThumbnail({ product }: { product: any }) {
    const hasMedia = product?.media && product.media.length > 0;
    const fallbackImage = product?.image_path;

    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        hasMedia || fallbackImage ? 'loading' : 'loaded',
    );

    if (!product) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                <PackageX size={24} className="mb-1 opacity-50" />
            </div>
        );
    }

    if (!hasMedia && !fallbackImage) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-50 to-purple-100 text-purple-300">
                <Package className="h-6 w-6" />
            </div>
        );
    }

    const isVideo = hasMedia && product.media[0].file_type === 'video';
    const srcPath = hasMedia ? product.media[0].file_path : fallbackImage;

    return (
        <div className="relative h-full w-full overflow-hidden bg-slate-100">
            {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                    <Spinner className="h-4 w-4 animate-spin text-purple-400" />
                </div>
            )}

            {status === 'error' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-purple-300">
                    <Package className="h-5 w-5 opacity-50" />
                </div>
            )}

            {isVideo ? (
                <div className="relative h-full w-full">
                    <video
                        src={`/storage/${srcPath}#t=0.1`}
                        className={`pointer-events-none h-full w-full object-cover transition-all duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
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
                    className={`h-full w-full object-cover transition-all duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            )}
        </div>
    );
}

export default function PayOrder({ order, clientKey }: any) {
    const { t } = useTranslation();

    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success'>(
        'idle',
    );
    const [countdown, setCountdown] = useState(5);

    const [cancelModalConfig, setCancelModalConfig] = useState<{
        isOpen: boolean;
        intent: 'cancel' | 'change';
    }>({
        isOpen: false,
        intent: 'cancel',
    });

    const productNames =
        order.items
            ?.map((item: any) => item.product?.title || t('Archived Product'))
            .join(', ') || t('your digital product');

    useEffect(() => {
        const scriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [clientKey]);

    useEffect(() => {
        if (paymentStatus === 'success' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

            return () => clearTimeout(timer);
        } else if (paymentStatus === 'success' && countdown === 0) {
            router.visit('/purchases');
        }
    }, [paymentStatus, countdown]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handlePay = () => {
        router.reload({
            only: ['order'],
            onSuccess: (page: any) => {
                if (page.props.order && page.props.order.status === 'pending') {
                    if (window.snap) {
                        window.snap.pay(page.props.order.snap_token, {
                            onSuccess: function () {
                                setPaymentStatus('success');
                            },
                            onPending: function () {
                                console.log('Payment is pending.');
                            },
                            onError: function () {
                                toast(
                                    t('Payment failed. Please try again.'),
                                    'error',
                                );
                            },
                            onClose: function () {
                                console.log('Customer closed the popup');
                            },
                        });
                    }
                }
            },
        });
    };

    const executeCancel = () => {
        router.patch(
            `/orders/${order.id}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCancelModalConfig({ isOpen: false, intent: 'cancel' });
                },
            },
        );
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900">
            <Head title={`${t('Pay Order')} #${order.id} - Soko`} />
            <SimpleNavbar backUrl="/purchases" />

            <main className="mx-auto max-w-3xl px-4 pt-32 pb-24 sm:px-6">
                {paymentStatus === 'idle' && (
                    <div className="animate-in duration-500 fade-in slide-in-from-bottom-4">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-black text-slate-900">
                                {t('Complete Your Checkout')}
                            </h1>
                            <p className="mt-2 text-slate-500">
                                {t('Order')} #{order.id}
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5">
                            {/* --- ORDER SUMMARY --- */}
                            <div className="border-b border-slate-100 bg-slate-50/30 p-6 sm:p-8">
                                <h2 className="mb-6 text-lg font-black text-slate-900">
                                    {t('Order Summary')}
                                </h2>

                                <div className="flex flex-col gap-4">
                                    {order.items?.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                                                <OrderItemThumbnail
                                                    product={item.product}
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="line-clamp-1 font-bold text-slate-900">
                                                        {item.product?.title ||
                                                            t(
                                                                'Archived Product',
                                                            )}
                                                    </h3>
                                                    {(!item.product ||
                                                        item.product
                                                            .deleted_at) && (
                                                        <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                            {t('Removed')}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                                                    <span>
                                                        {t('by')}{' '}
                                                        {item.product?.seller
                                                            ?.name ||
                                                            t('Unknown')}
                                                    </span>
                                                    {item.product?.seller
                                                        ?.username && (
                                                        <span className="text-xs text-slate-400">
                                                            (@
                                                            {
                                                                item.product
                                                                    .seller
                                                                    .username
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="font-black text-slate-900">
                                                {formatCurrency(item.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {order.created_at && (
                                    <OrderCountdown
                                        createdAt={order.created_at}
                                    />
                                )}
                            </div>

                            {/* --- PAYMENT ACTION --- */}
                            <div className="bg-white p-6 text-center sm:p-8">
                                <p className="mb-2 text-sm font-bold tracking-widest text-slate-500 uppercase">
                                    {t('Total Due')}
                                </p>
                                <p className="mb-8 text-4xl font-black text-slate-900">
                                    {formatCurrency(order.total_amount)}
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handlePay}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                                    >
                                        <CreditCard size={20} />
                                        {t('Continue to Payment')}
                                    </button>

                                    <div className="mt-2 grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() =>
                                                setCancelModalConfig({
                                                    isOpen: true,
                                                    intent: 'change',
                                                })
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                                        >
                                            <RefreshCcw size={16} />
                                            {t('Change Payment Method')}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setCancelModalConfig({
                                                    isOpen: true,
                                                    intent: 'cancel',
                                                })
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700"
                                        >
                                            <XCircle size={16} />
                                            {t('Cancel Order')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================
                    STATE 2: SUCCESS UI (POST-PAYMENT)
                ========================================= */}
                {paymentStatus === 'success' && (
                    <div className="animate-in duration-500 zoom-in-95 fade-in">
                        <div className="overflow-hidden rounded-4xl border border-emerald-200/60 bg-white p-8 text-center shadow-2xl ring-1 shadow-emerald-900/10 sm:p-12">
                            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 ring-8 ring-emerald-50">
                                <CheckCircle2 size={48} strokeWidth={2.5} />
                            </div>

                            <h1 className="mb-4 text-3xl font-black text-slate-900">
                                {t('Payment Successful!')}
                            </h1>

                            <p className="mb-8 text-lg leading-relaxed font-medium text-slate-600">
                                {t('Fantastic! Your order for')}{' '}
                                <span className="font-bold text-slate-900">
                                    "{productNames}"
                                </span>{' '}
                                {t(
                                    'is complete and is now ready to be downloaded.',
                                )}
                            </p>

                            <div className="mx-auto mb-8 max-w-sm rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100 ring-inset">
                                <div className="mb-3 flex justify-between text-sm font-bold text-slate-500">
                                    <span>
                                        {t('Redirecting to Library...')}
                                    </span>
                                    <span className="text-emerald-600">
                                        {countdown}s
                                    </span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-linear"
                                        style={{
                                            width: `${(countdown / 5) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <button
                                onClick={() => router.visit('/purchases')}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25"
                            >
                                {t('Go to Purchases Now')}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* --- DYNAMIC CONFIRMATION MODAL --- */}
            <ConfirmModal
                isOpen={cancelModalConfig.isOpen}
                onClose={() =>
                    setCancelModalConfig({
                        ...cancelModalConfig,
                        isOpen: false,
                    })
                }
                onConfirm={executeCancel}
                title={
                    cancelModalConfig.intent === 'change'
                        ? t('Change Payment Method')
                        : t('Cancel Order')
                }
                message={
                    cancelModalConfig.intent === 'change'
                        ? t(
                              'To change your payment method, we need to cancel this current transaction to release the locked virtual account. You can then re-add the item to your cart and check out again. Do you want to proceed?',
                          )
                        : t(
                              'Are you sure you want to cancel this order? This action will void the payment transaction and cannot be undone.',
                          )
                }
                confirmText={
                    cancelModalConfig.intent === 'change'
                        ? t('Yes, cancel & start over')
                        : t('Yes, cancel it')
                }
                variant="danger"
            />
        </div>
    );
}
