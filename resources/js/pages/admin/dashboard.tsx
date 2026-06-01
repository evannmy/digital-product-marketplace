import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Package,
    Activity,
    Landmark,
    ArrowRight,
    Clock,
} from 'lucide-react';
import Navbar from '@/components/navbar';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

export default function Dashboard({ stats }: any) {
    const { t } = useTranslation(); // Inject translator here

    // --- Currency Formatter ---
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FAFAFC] font-sans text-slate-900">
            <Head title={t('Admin Dashboard - Soko')} />
            <Navbar />

            <main className="relative z-10 flex-1 pt-32 pb-24">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            {t('System Overview')}
                        </h1>
                        <p className="mt-2 text-lg text-slate-500">
                            {t(
                                'Get a clear overview of your total users, active sellers, products, and platform revenue in one place.',
                            )}
                        </p>
                    </div>

                    {/* --- ACTION REQUIRED: PENDING TRANSFERS BANNER --- */}
                    {stats?.pending_transfers_count > 0 && (
                        <div className="mb-8 overflow-hidden rounded-3xl border border-amber-200/60 bg-amber-50/80 p-6 shadow-sm backdrop-blur-xl sm:flex sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-amber-900">
                                        {t('Action Required: ')}
                                        {stats.pending_transfers_count}
                                        {t(' Pending Payout(s)')}
                                    </h3>
                                    <p className="mt-0.5 text-sm font-medium text-amber-700">
                                        {t('Sellers are waiting for ')}
                                        {formatCurrency(
                                            stats.pending_transfers_amount,
                                        )}
                                        {t(' in net transfers.')}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-0 sm:shrink-0">
                                <Link
                                    href="/admin/finances"
                                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25"
                                >
                                    {t('Process Payouts')}{' '}
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* --- MAIN STATS GRID --- */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Stat Card 1: Links to Users Page */}
                        <Link
                            href="/admin/users"
                            className="group block overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-lg ring-1 shadow-rose-900/5 ring-white backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-indigo-500/10"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Users size={24} />
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600 sm:opacity-0 sm:group-hover:opacity-100">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                            <p className="mb-1 text-sm font-bold tracking-wider text-slate-400 uppercase">
                                {t('Total Users')}
                            </p>
                            <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                {stats?.total_users || 0}
                            </h3>
                        </Link>

                        {/* Stat Card 2: Links to Products Page */}
                        <Link
                            href="/admin/products"
                            className="group block overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-lg ring-1 shadow-rose-900/5 ring-white backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-emerald-500/10"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <Package size={24} />
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-emerald-50 group-hover:text-emerald-600 sm:opacity-0 sm:group-hover:opacity-100">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                            <p className="mb-1 text-sm font-bold tracking-wider text-slate-400 uppercase">
                                {t('Total Products')}
                            </p>
                            <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                {stats?.total_products || 0}
                            </h3>
                        </Link>

                        {/* Stat Card 3: Links to Users Page */}
                        <Link
                            href="/admin/users"
                            className="group block overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-lg ring-1 shadow-rose-900/5 ring-white backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-amber-500/10"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                    <Activity size={24} />
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-amber-50 group-hover:text-amber-600 sm:opacity-0 sm:group-hover:opacity-100">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                            <p className="mb-1 text-sm font-bold tracking-wider text-slate-400 uppercase">
                                {t('Active Sellers')}
                            </p>
                            <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                {stats?.active_sellers || 0}
                            </h3>
                        </Link>

                        {/* Stat Card 4: Links to Finances */}
                        <Link
                            href="/admin/finances"
                            className="group block overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-lg ring-1 shadow-rose-900/5 ring-white backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-purple-300 hover:shadow-purple-500/10"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                    <Landmark size={24} />
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-purple-50 group-hover:text-purple-600 sm:opacity-0 sm:group-hover:opacity-100">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                            <p className="mb-1 text-sm font-bold tracking-wider text-slate-400 uppercase">
                                {t('Platform Revenue')}
                            </p>
                            <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                {formatCurrency(stats?.platform_revenue || 0)}
                            </h3>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
