import { Head, useForm } from '@inertiajs/react';
import {
    Wallet,
    ArrowUpRight,
    Clock,
    ShieldCheck,
    TrendingDown,
    Receipt,
    ArrowRightLeft,
    CheckCircle,
    XCircle,
    X,
    Building2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';

export default function Earnings({
    stats,
    recentSales,
    withdrawals,
    withdrawalMethods,
    platformSettings, // <-- ADDED: Accept the settings from Laravel
}: any) {
    const [activeTab, setActiveTab] = useState<'sales' | 'withdrawals'>(
        'sales',
    );
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    // --- ADDED: Extract dynamic settings with safe fallbacks ---
    const minWithdrawal = Number(platformSettings?.withdrawal_minimum || 20000);
    const freeThreshold = Number(
        platformSettings?.withdrawal_free_threshold || 500000,
    );

    const { data, setData, post, processing, reset, errors } = useForm({
        amount: '',
        method_id: '',
        account_number: '',
    });

    const selectedMethod = withdrawalMethods?.find(
        (m: any) => m.id.toString() === data.method_id,
    );
    const currentFee = selectedMethod ? Number(selectedMethod.fee) : 0;

    const pendingStats = withdrawals?.reduce(
        (acc: { gross: number; fee: number; net: number }, wd: any) => {
            // Include both pending and processing states to be safe
            if (wd.status === 'pending' || wd.status === 'processing') {
                const amount = Number(wd.amount || 0);
                const fee = Number(wd.fee || 0);
                const net = Number(wd.net_amount || amount - fee || 0);

                acc.gross += amount;
                acc.fee += fee;
                acc.net += net;
            }

            return acc;
        },
        { gross: 0, fee: 0, net: 0 },
    ) || { gross: 0, fee: 0, net: 0 };

    const hasPendingWithdrawal = withdrawals?.some(
        (wd: any) => wd.status === 'pending' || wd.status === 'processing',
    );

    useEffect(() => {
        if (isWithdrawModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isWithdrawModalOpen]);

    const handleWithdrawalRequest = (e: React.FormEvent) => {
        e.preventDefault();
        post('/seller/withdrawals', {
            preserveScroll: true,
            onSuccess: () => {
                setIsWithdrawModalOpen(false);
                reset();
                toast('Withdrawal request submitted successfully!', 'success');
                setActiveTab('withdrawals');
            },
            onError: () => {
                toast(
                    'Failed to submit request. Please check the form.',
                    'error',
                );
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/20 ring-inset">
                        <CheckCircle size={12} /> Completed
                    </span>
                );
            case 'pending':
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-500/20 ring-inset">
                        <Clock size={12} /> Processing
                    </span>
                );
            case 'failed':
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-500/20 ring-inset">
                        <XCircle size={12} /> Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-500/20 ring-inset">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAFC] font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
            <Head title="My Earnings - Soko" />
            <Navbar />

            <main className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            My Earnings
                        </h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Manage your revenue and withdraw your funds.
                        </p>
                    </div>
                </div>

                {/* --- STAT CARDS --- */}
                <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="group overflow-hidden rounded-4xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-emerald-900/5 ring-white transition-all hover:shadow-2xl hover:shadow-emerald-900/10 lg:col-span-3">
                        <div className="flex flex-col gap-6 bg-white/80 p-8 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-10">
                            <div className="flex items-start gap-6">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 transition-transform group-hover:scale-105">
                                    <Wallet className="h-8 w-8 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="mb-1 text-sm font-bold tracking-wider text-slate-400 uppercase">
                                        Total Gross Sales
                                    </p>
                                    <p className="max-w-xs text-xs leading-relaxed font-medium text-slate-500">
                                        The total amount paid by buyers for your
                                        products before platform deductions.
                                    </p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <h2 className="bg-linear-to-br from-slate-900 to-slate-700 bg-clip-text text-4xl font-black break-all text-transparent sm:text-5xl sm:break-normal md:text-6xl">
                                    {formatCurrency(stats?.grossRevenue || 0)}
                                </h2>

                                <div className="mt-3 flex flex-col gap-2 sm:items-end">
                                    <div className="flex items-center justify-start gap-1.5 text-sm font-bold text-rose-500 sm:justify-end">
                                        <TrendingDown size={16} />
                                        <span>
                                            -{' '}
                                            {formatCurrency(
                                                stats?.platformFees || 0,
                                            )}{' '}
                                            (Platform Fees)
                                        </span>
                                    </div>

                                    {/* --- ADDED: Net Sales Calculation --- */}
                                    <div className="flex w-full items-center justify-start border-t border-slate-200/60 pt-2 text-base font-black text-emerald-600 sm:w-auto sm:justify-end">
                                        <span>
                                            ={' '}
                                            {formatCurrency(
                                                (stats?.grossRevenue || 0) -
                                                    (stats?.platformFees || 0),
                                            )}{' '}
                                            Net Sales
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-sm ring-1 ring-white backdrop-blur-xl transition-colors hover:bg-white lg:col-span-1">
                        <div>
                            <div className="mb-6 inline-flex rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100/50">
                                <Clock className="h-7 w-7 text-amber-500" />
                            </div>
                            <p className="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                Pending Withdrawals
                            </p>
                            <p className="mb-6 text-xs font-medium text-slate-500">
                                Funds currently being processed by the platform
                                administrators.
                            </p>
                        </div>
                        <div>
                            <div className="mb-1 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                Net Expected
                            </div>
                            <h3 className="text-3xl font-black break-all text-slate-900 sm:break-normal">
                                {formatCurrency(pendingStats.net)}
                            </h3>

                            {/* Dynamic breakdown of the gross and fees */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                                <span>
                                    Gross: {formatCurrency(pendingStats.gross)}
                                </span>
                                {pendingStats.fee > 0 && (
                                    <>
                                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                        <span className="flex items-center text-rose-500">
                                            <TrendingDown
                                                size={12}
                                                className="mr-0.5"
                                            />
                                            Fee:{' '}
                                            {formatCurrency(pendingStats.fee)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-[#111625] p-8 shadow-lg ring-1 ring-[#1A2235] lg:col-span-2">
                        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="mb-6 inline-flex rounded-xl bg-[#1C332D] p-3 ring-1 ring-emerald-900/30">
                                <ShieldCheck className="h-6 w-6 text-[#4ADE80]" />
                            </div>
                            <p className="mb-2 text-xs font-bold tracking-wider text-[#4ADE80] uppercase">
                                Available for Payout (Net)
                            </p>
                            <p className="mb-8 max-w-md text-sm font-medium text-slate-400">
                                These funds have cleared, deductions are taken,
                                and they are ready for withdrawal.
                            </p>
                        </div>
                        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <h3 className="text-4xl font-black break-all text-white sm:text-5xl sm:break-normal">
                                {formatCurrency(stats?.availablePayout || 0)}
                            </h3>

                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                <button
                                    onClick={() => setIsWithdrawModalOpen(true)}
                                    disabled={
                                        hasPendingWithdrawal || // <-- ADDED: Lock if pending!
                                        !stats?.availablePayout ||
                                        stats.availablePayout < minWithdrawal
                                    }
                                    className="group flex items-center justify-center gap-2 rounded-xl bg-[#327254] px-6 py-3 text-sm font-bold text-emerald-50 transition-all hover:bg-[#3D8C66] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                                >
                                    Request Withdrawal
                                    <ArrowUpRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 disabled:group-hover:translate-x-0 disabled:group-hover:translate-y-0"
                                    />
                                </button>

                                {/* --- UPDATED: Dynamic Warning Message --- */}
                                {hasPendingWithdrawal ? (
                                    <span className="text-xs font-medium text-amber-500">
                                        ⏳ You have a pending request. Please
                                        wait for it to process.
                                    </span>
                                ) : !stats?.availablePayout ||
                                  stats.availablePayout < minWithdrawal ? (
                                    <span className="text-xs font-medium text-slate-500">
                                        * Minimum withdrawal is{' '}
                                        {formatCurrency(minWithdrawal)}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TABBED DATA TABLES --- */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5">
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 pt-4 sm:gap-6 sm:px-8">
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`flex items-center gap-2 border-b-2 px-4 pb-4 text-sm font-bold transition-colors ${activeTab === 'sales' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Receipt size={18} />
                            Recent Sales
                        </button>
                        <button
                            onClick={() => setActiveTab('withdrawals')}
                            className={`flex items-center gap-2 border-b-2 px-4 pb-4 text-sm font-bold transition-colors ${activeTab === 'withdrawals' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <ArrowRightLeft size={18} />
                            Withdrawal History
                        </button>
                    </div>

                    {/* TAB CONTENT: SALES */}
                    {activeTab === 'sales' && (
                        <div>
                            {!recentSales || recentSales.length === 0 ? (
                                <div className="py-20 text-center text-slate-500">
                                    No successful transactions yet.
                                </div>
                            ) : (
                                <>
                                    <div className="block divide-y divide-slate-100 sm:hidden">
                                        {recentSales.map((sale: any) => (
                                            <div
                                                key={sale.id}
                                                className="p-5 hover:bg-slate-50"
                                            >
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div className="flex flex-wrap items-center gap-2 pr-4">
                                                        <span className="line-clamp-2 font-bold text-slate-900">
                                                            {sale.title}
                                                        </span>
                                                        {sale.is_archived && (
                                                            <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                Removed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <span className="text-[11px] font-medium text-slate-400">
                                                            {sale.date}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between rounded-xl bg-slate-50 p-3">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <span className="text-slate-500">
                                                            Gross:{' '}
                                                            {formatCurrency(
                                                                sale.gross,
                                                            )}
                                                        </span>
                                                        <span className="text-rose-500">
                                                            Fee: -
                                                            {formatCurrency(
                                                                sale.fee,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                            Net Cut
                                                        </span>
                                                        <span className="font-black text-emerald-600">
                                                            +
                                                            {formatCurrency(
                                                                sale.net,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="hidden overflow-x-auto sm:block">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-white text-slate-500">
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Date
                                                    </th>
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Product
                                                    </th>
                                                    <th className="px-8 py-5 text-right font-bold tracking-wider uppercase">
                                                        Gross
                                                    </th>
                                                    <th className="px-8 py-5 text-right font-bold tracking-wider text-rose-500 uppercase">
                                                        Fee
                                                    </th>
                                                    <th className="px-8 py-5 text-right font-bold tracking-wider text-emerald-600 uppercase">
                                                        Net Cut
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {recentSales.map(
                                                    (sale: any) => (
                                                        <tr
                                                            key={sale.id}
                                                            className="transition-colors hover:bg-slate-50/50"
                                                        >
                                                            <td className="px-8 py-5 text-slate-500">
                                                                {sale.date}
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-900">
                                                                        {
                                                                            sale.title
                                                                        }
                                                                    </span>
                                                                    {sale.is_archived && (
                                                                        <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                            Removed
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 text-right font-medium text-slate-600">
                                                                {formatCurrency(
                                                                    sale.gross,
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-5 text-right font-medium text-rose-500">
                                                                -{' '}
                                                                {formatCurrency(
                                                                    sale.fee,
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-5 text-right text-base font-black text-emerald-600">
                                                                +{' '}
                                                                {formatCurrency(
                                                                    sale.net,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB CONTENT: WITHDRAWALS */}
                    {activeTab === 'withdrawals' && (
                        <div>
                            {!withdrawals || withdrawals.length === 0 ? (
                                <div className="py-20 text-center text-slate-500">
                                    You haven't requested any withdrawals yet.
                                </div>
                            ) : (
                                <>
                                    <div className="block divide-y divide-slate-100 sm:hidden">
                                        {withdrawals.map((wd: any) => (
                                            <div
                                                key={wd.id}
                                                className="flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="mb-1 block font-mono text-[10px] font-bold text-slate-400">
                                                            #{wd.id}
                                                        </span>
                                                        <div className="font-bold text-slate-900">
                                                            {wd.bank_name}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {wd.account_number}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <div className="text-[11px] font-medium text-slate-400">
                                                            {wd.date ||
                                                                (wd.created_at
                                                                    ? new Date(
                                                                          wd.created_at,
                                                                      ).toLocaleDateString(
                                                                          'en-GB',
                                                                      )
                                                                    : '-')}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-end justify-between rounded-xl bg-slate-50 p-3">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <span className="text-slate-500">
                                                            Gross:{' '}
                                                            {formatCurrency(
                                                                wd.amount,
                                                            )}
                                                        </span>
                                                        <span className="text-rose-500">
                                                            Fee: -{' '}
                                                            {formatCurrency(
                                                                wd.fee,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                            Net Received
                                                        </span>
                                                        <span className="text-base font-black text-emerald-600">
                                                            {formatCurrency(
                                                                wd.net_amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-1">
                                                    {getStatusBadge(wd.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="hidden overflow-x-auto sm:block">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-white text-slate-500">
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Date
                                                    </th>
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Ref ID
                                                    </th>
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Destination
                                                    </th>
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-8 py-5 text-right font-bold tracking-wider uppercase">
                                                        Gross
                                                    </th>
                                                    <th className="px-8 py-5 text-right font-bold tracking-wider text-rose-500 uppercase">
                                                        Fee
                                                    </th>
                                                    <th className="px-8 py-5 text-right font-bold tracking-wider text-emerald-600 uppercase">
                                                        Net Received
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {withdrawals.map((wd: any) => (
                                                    <tr
                                                        key={wd.id}
                                                        className="transition-colors hover:bg-slate-50/50"
                                                    >
                                                        <td className="px-8 py-5 text-slate-500">
                                                            {wd.date ||
                                                                (wd.created_at
                                                                    ? new Date(
                                                                          wd.created_at,
                                                                      ).toLocaleDateString(
                                                                          'en-GB',
                                                                      )
                                                                    : '-')}
                                                        </td>
                                                        <td className="px-8 py-5 font-mono text-xs font-bold text-slate-400">
                                                            #{wd.id}
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="font-medium text-slate-700">
                                                                {wd.bank_name}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                {
                                                                    wd.account_number
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            {getStatusBadge(
                                                                wd.status,
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-5 text-right font-medium text-slate-600">
                                                            {formatCurrency(
                                                                wd.amount,
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-5 text-right font-medium text-rose-500">
                                                            -{' '}
                                                            {formatCurrency(
                                                                wd.fee,
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-5 text-right text-base font-black text-emerald-600">
                                                            {formatCurrency(
                                                                wd.net_amount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* --- WITHDRAWAL MODAL (HYBRID FEE MODEL) --- */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() =>
                            !processing && setIsWithdrawModalOpen(false)
                        }
                    ></div>

                    <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-xl transition-all">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                        <Building2 size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">
                                        Request Withdrawal
                                    </h3>
                                </div>
                                <button
                                    onClick={() =>
                                        !processing &&
                                        setIsWithdrawModalOpen(false)
                                    }
                                    className="rounded-full bg-slate-100 p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={handleWithdrawalRequest}
                            className="p-6"
                        >
                            {/* --- DYNAMIC THRESHOLD INFO BANNER --- */}
                            <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                                <p className="text-sm font-medium text-indigo-800">
                                    💡 Withdrawals over{' '}
                                    <strong className="font-black">
                                        {formatCurrency(freeThreshold)}
                                    </strong>{' '}
                                    are completely{' '}
                                    <strong className="font-black">FREE</strong>
                                    ! A flat bank transfer fee of Rp 2.500
                                    applies to amounts below the threshold.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <div className="mb-1.5 flex justify-between">
                                        <label className="text-sm font-bold text-slate-700">
                                            Withdrawal Amount (Rp)
                                        </label>
                                        <span className="text-xs font-bold text-slate-400">
                                            Max:{' '}
                                            {formatCurrency(
                                                stats?.availablePayout || 0,
                                            )}
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        // Format the raw string number into an IDR string with dots
                                        value={
                                            data.amount
                                                ? new Intl.NumberFormat(
                                                      'id-ID',
                                                  ).format(Number(data.amount))
                                                : ''
                                        }
                                        onChange={(e) => {
                                            // Strip out all non-numeric characters (like dots) before saving to state
                                            const rawValue =
                                                e.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                );
                                            setData('amount', rawValue);
                                        }}
                                        className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all outline-none focus:ring-1 ${
                                            data.amount &&
                                            Number(data.amount) < minWithdrawal
                                                ? 'border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                                                : 'border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-emerald-500'
                                        }`}
                                        placeholder={`Min. ${formatCurrency(minWithdrawal)}`}
                                    />

                                    {/* --- NEW: Dynamic Minimum Warning --- */}
                                    {data.amount &&
                                        Number(data.amount) < minWithdrawal &&
                                        !errors.amount && (
                                            <p className="mt-1.5 text-xs font-bold text-rose-500">
                                                ⚠️ Minimum withdrawal is{' '}
                                                {formatCurrency(minWithdrawal)}.
                                            </p>
                                        )}

                                    {errors.amount && (
                                        <p className="mt-1.5 text-xs font-bold text-rose-500">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>

                                {/* --- DYNAMIC FEE CALCULATOR --- */}
                                {data.amount &&
                                    Number(data.amount) >= minWithdrawal &&
                                    data.method_id && (
                                        <div className="space-y-2 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 ring-inset">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">
                                                    Requested Amount
                                                </span>
                                                <span className="font-medium text-slate-700">
                                                    {formatCurrency(
                                                        Number(data.amount),
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">
                                                    Transfer Fee
                                                </span>
                                                <span
                                                    className={`font-medium ${Number(data.amount) >= freeThreshold || currentFee === 0 ? 'text-emerald-600' : 'text-rose-500'}`}
                                                >
                                                    {Number(data.amount) >=
                                                        freeThreshold || // <-- DYNAMIC CHECK
                                                    currentFee === 0
                                                        ? 'FREE'
                                                        : `- ${formatCurrency(currentFee)}`}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                                                <span className="text-sm font-bold text-slate-900">
                                                    You will receive
                                                </span>
                                                <span className="text-lg font-black text-emerald-600">
                                                    {formatCurrency(
                                                        Number(data.amount) >=
                                                            freeThreshold ||
                                                            currentFee === 0
                                                            ? Number(
                                                                  data.amount,
                                                              )
                                                            : Number(
                                                                  data.amount,
                                                              ) - currentFee,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                {/* --- DROPDOWN SELECTOR --- */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-bold text-slate-700">
                                        Withdrawal Method
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={data.method_id}
                                            onChange={(e) =>
                                                setData(
                                                    'method_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        >
                                            <option value="" disabled>
                                                Select a transfer method...
                                            </option>
                                            {withdrawalMethods?.map(
                                                (method: any) => (
                                                    <option
                                                        key={method.id}
                                                        value={method.id}
                                                    >
                                                        {method.name}
                                                        {Number(method.fee) > 0
                                                            ? ` (Fee: ${formatCurrency(method.fee)})`
                                                            : ' (Free)'}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <svg
                                                className="h-4 w-4 fill-current"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                    fillRule="evenodd"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-bold text-slate-700">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.account_number}
                                        onChange={(e) =>
                                            setData(
                                                'account_number',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                        placeholder="Enter your account/phone number"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsWithdrawModalOpen(false)
                                    }
                                    className="flex-1 rounded-xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.amount ||
                                        Number(data.amount) < minWithdrawal || // <-- ADDED: Locks the button if below minimum
                                        !data.method_id ||
                                        !data.account_number
                                    }
                                    className="flex flex-2 items-center justify-center rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {processing
                                        ? 'Processing...'
                                        : 'Confirm Withdrawal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
