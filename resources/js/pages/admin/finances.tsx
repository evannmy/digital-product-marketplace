import { Head, router, Link, usePage } from '@inertiajs/react';
import {
    Landmark,
    CheckCircle,
    Clock,
    XCircle,
    X,
    Wallet,
    Users,
    Loader2,
} from 'lucide-react';
// --- ADDED useCallback TO THE IMPORT ---
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

export default function AdminFinances({ stats, withdrawals }: any) {
    const { t } = useTranslation(); // Inject translator here

    // 1. Grab the flash messages from Inertia's page props
    const { flash } = usePage().props as any;

    // 2. Listen for changes to the flash object and trigger the toast
    useEffect(() => {
        if (flash?.success) {
            toast(flash.success, 'success');
        }

        if (flash?.error) {
            toast(flash.error, 'error');
        }
    }, [flash]);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | null;
        withdrawal: any | null;
    }>({
        isOpen: false,
        type: null,
        withdrawal: null,
    });

    const [isProcessing, setIsProcessing] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const totalCreatorEarnings =
        (stats?.totalSalesVolume || 0) - (stats?.totalPlatformRevenue || 0);

    const promptApprove = (wd: any) => {
        setModalConfig({ isOpen: true, type: 'approve', withdrawal: wd });
    };

    const promptReject = (wd: any) => {
        setModalConfig({ isOpen: true, type: 'reject', withdrawal: wd });
    };

    const executeAction = useCallback(() => {
        if (!modalConfig.withdrawal?.id || !modalConfig.type) return;

        setIsProcessing(true);

        const route = `/admin/withdrawals/${modalConfig.withdrawal.id}/${modalConfig.type}`;

        router.patch(
            route,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Cukup tutup modal.
                    // Pesan toast SUDAH terjemahkan oleh backend dan akan muncul otomatis
                    // melalui global flash message handler Anda.
                    setModalConfig({
                        isOpen: false,
                        type: null,
                        withdrawal: null,
                    });
                },
                onError: () => {
                    setModalConfig({
                        isOpen: false,
                        type: null,
                        withdrawal: null,
                    });
                    // Fallback jika terjadi error server 500 yang tidak tertangkap controller
                    toast(t('Failed to process withdrawal.'), 'error');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    }, [modalConfig, t]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isProcessing) return;

            if (e.key === 'Enter') {
                e.preventDefault();
                executeAction();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setModalConfig({ isOpen: false, type: null, withdrawal: null });
            }
        };

        if (modalConfig.isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [modalConfig, isProcessing, executeAction]);

    const getStatusBadge = (status: string) => {
        if (status === 'completed') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/20 ring-inset">
                    <CheckCircle size={12} /> {t('Paid')}
                </span>
            );
        }

        if (status === 'failed' || status === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-500/20 ring-inset">
                    <XCircle size={12} /> {t('Rejected')}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-500/20 ring-inset">
                <Clock size={12} /> {t('Pending')}
            </span>
        );
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900">
            <Head title={t('Platform Finances - Soko Admin')} />
            <Navbar />

            <main className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        {t('Platform Finances')}
                    </h1>
                    <p className="mt-2 text-lg text-slate-500">
                        {t(
                            'Monitor platform revenue and manage seller payouts.',
                        )}
                    </p>
                </div>

                <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl lg:p-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Wallet size={24} />
                        </div>
                        <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            {t('Total Transaction Value')}
                        </p>
                        <h3 className="text-2xl font-black text-slate-900 lg:text-3xl">
                            {formatCurrency(stats?.totalSalesVolume || 0)}
                        </h3>
                        <p className="mt-2 text-xs font-medium text-slate-500">
                            {t('Total funds processed across the platform.')}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl lg:p-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Users size={24} />
                        </div>
                        <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            {t('Total Creator Earnings')}
                        </p>
                        <h3 className="text-2xl font-black text-slate-900 lg:text-3xl">
                            {formatCurrency(totalCreatorEarnings)}
                        </h3>
                        <p className="mt-2 text-xs font-medium text-slate-500">
                            {t('Total net income earned by creators.')}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl lg:p-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Landmark size={24} />
                        </div>
                        <p className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                            {t('Total Platform Revenue')}
                        </p>
                        <h3 className="text-2xl font-black text-slate-900 lg:text-3xl">
                            {formatCurrency(stats?.totalPlatformRevenue || 0)}
                        </h3>
                        <p className="mt-2 text-xs font-medium text-slate-500">
                            {t("Soko's total earnings from transactions.")}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-amber-200/60 bg-amber-50/50 p-6 shadow-sm backdrop-blur-xl lg:p-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                            <Clock size={24} />
                        </div>
                        <p className="mb-1 text-xs font-bold tracking-wider text-amber-600/70 uppercase">
                            {t('Pending Transfers')}
                        </p>
                        <h3 className="text-2xl font-black text-amber-700 lg:text-3xl">
                            {formatCurrency(stats?.pendingPayoutsAmount || 0)}
                        </h3>
                        <p className="mt-2 text-xs font-medium text-amber-600/80">
                            {t('Across ')} {stats?.pendingPayoutsCount || 0}{' '}
                            {t(' pending withdrawal request(s).')}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5">
                    <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:px-8">
                        <h2 className="text-xl font-black text-slate-900">
                            {t('Withdrawal Requests')}
                        </h2>
                    </div>

                    {withdrawals?.data?.length === 0 ? (
                        <div className="py-20 text-center text-slate-500">
                            {t('No withdrawal requests.')}
                        </div>
                    ) : (
                        <>
                            <div className="block divide-y divide-slate-100 sm:hidden">
                                {withdrawals.data.map((wd: any) => (
                                    <div
                                        key={wd.id}
                                        className="flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="font-bold text-slate-900">
                                                        {wd.seller_name}
                                                    </span>
                                                    {wd.seller_username && (
                                                        <span className="text-[11px] font-medium text-slate-400">
                                                            @
                                                            {wd.seller_username}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-0.5 text-xs text-slate-500">
                                                    {wd.seller_email}
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <div className="font-bold text-slate-900">
                                                    {wd.date}
                                                </div>
                                                <div className="font-mono text-[10px] text-slate-400">
                                                    {wd.ref_id}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
                                            <div className="flex flex-col gap-1 text-sm">
                                                <span className="text-xs text-slate-500">
                                                    {t('Destination Bank')}
                                                </span>
                                                <span className="font-semibold text-slate-700">
                                                    {wd.bank_details}
                                                </span>
                                            </div>

                                            <div className="flex items-end justify-between border-t border-slate-200/60 pt-3">
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <span className="text-slate-500">
                                                        {t('Amount:')}{' '}
                                                        {formatCurrency(
                                                            wd.gross_amount,
                                                        )}
                                                    </span>
                                                    <span className="text-rose-500">
                                                        {t('Fee: -')}{' '}
                                                        {formatCurrency(wd.fee)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                        {t('Transfer')}
                                                    </span>
                                                    <span className="text-base font-black text-emerald-600">
                                                        {formatCurrency(
                                                            wd.net_amount,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div>
                                                {getStatusBadge(wd.status)}
                                            </div>
                                            <div>
                                                {wd.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                promptReject(wd)
                                                            }
                                                            className="inline-flex items-center rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 shadow-sm transition-colors hover:bg-rose-100"
                                                        >
                                                            {t('Reject')}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                promptApprove(
                                                                    wd,
                                                                )
                                                            }
                                                            className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-600"
                                                        >
                                                            {t('Paid')}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {t('Processed')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-white text-slate-500">
                                            <th className="px-6 py-5 font-bold tracking-wider uppercase">
                                                {t('Date / Ref')}
                                            </th>
                                            <th className="px-6 py-5 font-bold tracking-wider uppercase">
                                                {t('Seller')}
                                            </th>
                                            <th className="px-6 py-5 font-bold tracking-wider uppercase">
                                                {t('Destination')}
                                            </th>
                                            <th className="px-6 py-5 text-right font-bold tracking-wider uppercase">
                                                {t('Amount')}
                                            </th>
                                            <th className="px-6 py-5 text-right font-bold tracking-wider text-rose-500 uppercase">
                                                {t('Fee')}
                                            </th>
                                            <th className="px-6 py-5 text-right font-bold tracking-wider text-emerald-600 uppercase">
                                                {t('Transfer')}
                                            </th>
                                            <th className="px-6 py-5 text-center font-bold tracking-wider uppercase">
                                                {t('Status')}
                                            </th>
                                            <th className="px-6 py-5 text-right font-bold tracking-wider uppercase">
                                                {t('Action')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {withdrawals.data.map((wd: any) => (
                                            <tr
                                                key={wd.id}
                                                className="transition-colors hover:bg-slate-50/50"
                                            >
                                                <td className="px-6 py-5 align-top">
                                                    <div className="font-bold text-slate-900">
                                                        {wd.date}
                                                    </div>
                                                    <div className="font-mono text-xs text-slate-400">
                                                        {wd.ref_id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 align-top">
                                                    <div className="flex flex-col items-start">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-900">
                                                                {wd.seller_name}
                                                            </span>
                                                            {wd.seller_username && (
                                                                <span className="text-[11px] font-medium text-slate-400">
                                                                    @
                                                                    {
                                                                        wd.seller_username
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-0.5 text-xs text-slate-500">
                                                            {wd.seller_email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 align-top font-medium text-slate-700">
                                                    {wd.bank_details}
                                                </td>
                                                <td className="px-6 py-5 text-right align-top font-medium text-slate-600">
                                                    {formatCurrency(
                                                        wd.gross_amount,
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right align-top font-medium text-rose-500">
                                                    - {formatCurrency(wd.fee)}
                                                </td>
                                                <td className="px-6 py-5 text-right align-top text-base font-black text-emerald-600">
                                                    {formatCurrency(
                                                        wd.net_amount,
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-center align-top">
                                                    {getStatusBadge(wd.status)}
                                                </td>
                                                <td className="px-6 py-5 text-right align-top">
                                                    {wd.status === 'pending' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    promptReject(
                                                                        wd,
                                                                    )
                                                                }
                                                                className="inline-flex items-center rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition-colors hover:bg-rose-100"
                                                            >
                                                                {t('Reject')}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    promptApprove(
                                                                        wd,
                                                                    )
                                                                }
                                                                className="inline-flex items-center rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-600"
                                                            >
                                                                {t('Paid')}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-medium text-slate-400">
                                                            {t('Processed')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {withdrawals?.links && withdrawals.links.length > 3 && (
                        <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-6 sm:px-8">
                            <div className="flex flex-wrap justify-center gap-2">
                                {withdrawals.links.map(
                                    (link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            preserveScroll
                                            preserveState
                                            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition-all ${
                                                link.active
                                                    ? 'bg-slate-900 text-white shadow-md'
                                                    : !link.url
                                                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 opacity-50'
                                                      : 'bg-white text-slate-600 ring-1 ring-slate-200/60 hover:bg-slate-50 hover:text-purple-600 hover:shadow-sm hover:ring-purple-200'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() =>
                            !isProcessing &&
                            setModalConfig({
                                isOpen: false,
                                type: null,
                                withdrawal: null,
                            })
                        }
                    ></div>

                    <div className="relative w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-8 text-center align-middle shadow-xl transition-all">
                        <button
                            onClick={() =>
                                setModalConfig({
                                    isOpen: false,
                                    type: null,
                                    withdrawal: null,
                                })
                            }
                            disabled={isProcessing}
                            className="absolute top-5 right-5 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>

                        <div
                            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${modalConfig.type === 'approve' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}
                        >
                            {modalConfig.type === 'approve' ? (
                                <CheckCircle size={32} />
                            ) : (
                                <XCircle size={32} />
                            )}
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-slate-900">
                            {modalConfig.type === 'approve'
                                ? t('Approve Withdrawal')
                                : t('Reject Withdrawal')}
                        </h3>

                        <p className="mb-8 text-sm leading-relaxed text-slate-500">
                            {modalConfig.type === 'approve' ? (
                                <>
                                    {t('Are you sure you have transferred ')}
                                    <strong className="font-black text-slate-900">
                                        {formatCurrency(
                                            modalConfig.withdrawal
                                                ?.net_amount || 0,
                                        )}
                                    </strong>{' '}
                                    {t(
                                        " to the seller's bank account? This will mark the payout as completed.",
                                    )}
                                </>
                            ) : (
                                <>
                                    {t(
                                        'Are you sure you want to reject this withdrawal of ',
                                    )}
                                    <strong className="font-black text-slate-900">
                                        {formatCurrency(
                                            modalConfig.withdrawal
                                                ?.gross_amount || 0,
                                        )}
                                    </strong>
                                    {t(
                                        "? The locked funds will be returned to the seller's available balance.",
                                    )}
                                </>
                            )}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() =>
                                    setModalConfig({
                                        isOpen: false,
                                        type: null,
                                        withdrawal: null,
                                    })
                                }
                                disabled={isProcessing}
                                className="flex-1 rounded-xl bg-slate-50 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                onClick={executeAction}
                                disabled={isProcessing}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all ${
                                    modalConfig.type === 'approve'
                                        ? 'bg-indigo-500'
                                        : 'bg-rose-500'
                                } ${
                                    isProcessing
                                        ? 'cursor-not-allowed opacity-70 hover:translate-y-0 hover:shadow-none'
                                        : modalConfig.type === 'approve'
                                          ? 'hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25'
                                          : 'hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/25'
                                }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        {t('Processing...')}
                                    </>
                                ) : modalConfig.type === 'approve' ? (
                                    t('Yes, mark as paid')
                                ) : (
                                    t('Yes, reject request')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
