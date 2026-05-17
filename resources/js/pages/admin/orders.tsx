import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    Filter,
    TrendingUp,
    X,
    Hourglass,
    Package,
    ChevronRight,
    PackageOpen,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';

// --- FIXED: Real-time Countdown Timer for Admins ---
function AdminOrderCountdown({ createdAt }: { createdAt: string }) {
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

    if (timeInfo.isExpired) {
        return <span className="text-rose-600">Expired</span>;
    }

    return <span>Expires: {timeInfo.text}</span>;
}

export default function AdminOrders({ orders, stats, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    // --- STATES ---
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [cancelModalConfig, setCancelModalConfig] = useState<{
        isOpen: boolean;
        orderId: number | null;
    }>({
        isOpen: false,
        orderId: null,
    });

    const [isProcessing, setIsProcessing] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/orders',
            { search, status: statusFilter },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatusFilter(newStatus);
        router.get(
            '/admin/orders',
            { search, status: newStatus },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const toggleRow = (id: number) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    const promptCancel = (id: number) => {
        setCancelModalConfig({ isOpen: true, orderId: id });
    };

    const executeCancel = () => {
        if (!cancelModalConfig.orderId) return;

        setIsProcessing(true);

        router.patch(
            `/admin/orders/${cancelModalConfig.orderId}/cancel`,
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/20">
                        <CheckCircle size={12} /> Completed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-500/20">
                        <Clock size={12} /> Awaiting Payment
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-500/20">
                        <XCircle size={12} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900">
            <Head title="Order Management - Soko" />
            <Navbar />

            <main className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                {/* --- HEADER --- */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            Order Management
                        </h1>
                        <p className="mt-2 text-lg text-slate-500">
                            Monitor automated transactions from Midtrans.
                        </p>
                    </div>
                </div>

                {/* --- METRICS DASHBOARD --- */}
                <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="rounded-3xl border border-amber-200/60 bg-amber-50/50 p-6 shadow-sm">
                        <div className="mb-4 inline-flex rounded-xl bg-amber-100 p-3 text-amber-600">
                            <Clock size={20} />
                        </div>
                        <p className="text-sm font-bold tracking-wider text-amber-600/70 uppercase">
                            Pending Payments
                        </p>
                        <h3 className="text-3xl font-black text-amber-700">
                            {stats?.pending || 0}
                        </h3>
                    </div>
                    <div className="rounded-3xl border border-emerald-200/60 bg-emerald-50/50 p-6 shadow-sm">
                        <div className="mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-600">
                            <CheckCircle size={20} />
                        </div>
                        <p className="text-sm font-bold tracking-wider text-emerald-600/70 uppercase">
                            Completed Orders
                        </p>
                        <h3 className="text-3xl font-black text-emerald-700">
                            {stats?.completed || 0}
                        </h3>
                    </div>
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
                        <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-3 text-slate-600">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-sm font-bold tracking-wider text-slate-400 uppercase">
                            Total Orders
                        </p>
                        <h3 className="text-3xl font-black text-slate-900">
                            {stats?.total || 0}
                        </h3>
                    </div>
                </div>

                {/* --- MAIN DATA CONTAINER --- */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5">
                    {/* Toolbar (Search & Filter) */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <div className="flex items-center gap-3">
                            <ClipboardList
                                className="text-purple-600"
                                size={24}
                            />
                            <h2 className="text-xl font-black text-slate-900">
                                Transaction Log
                            </h2>
                        </div>

                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-3 sm:flex-row sm:items-center"
                        >
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Order ID or Buyer..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-9 text-sm transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            </div>
                            <div className="relative shrink-0 sm:w-40">
                                <select
                                    value={statusFilter}
                                    onChange={handleFilterChange}
                                    className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm font-medium text-slate-600 transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="success">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <Filter className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                            <button type="submit" className="hidden"></button>
                        </form>
                    </div>

                    {orders.data.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/50">
                                <ClipboardList className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                No orders found
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* --- 1. RESPONSIVE GRID/CARD VIEW (Mobile & Tablet) --- */}
                            <div className="grid grid-cols-1 gap-px bg-slate-100 md:grid-cols-2 md:gap-4 md:bg-white md:p-6 lg:hidden">
                                {orders.data.map((order: any) => {
                                    const isExpanded =
                                        expandedOrderId === order.id;
                                    const hasMultipleItems =
                                        order.items && order.items.length > 1;

                                    const archivedItemsCount =
                                        order.items?.filter(
                                            (i: any) =>
                                                i.product?.deleted_at ||
                                                !i.product,
                                        ).length || 0;

                                    return (
                                        <div
                                            key={order.id}
                                            className={`flex flex-col gap-4 bg-white p-6 transition-colors md:rounded-2xl md:border md:shadow-sm ${order.status === 'cancelled' ? 'opacity-75 grayscale' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-bold text-slate-900">
                                                            {order.buyer
                                                                ? order.buyer
                                                                      .name
                                                                : 'Guest'}
                                                        </span>
                                                        {order.buyer
                                                            ?.username && (
                                                            <span className="mt-0.5 text-[11px] font-medium text-slate-400">
                                                                @
                                                                {
                                                                    order.buyer
                                                                        .username
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 font-mono text-[11px] text-slate-400">
                                                        #{order.id} •{' '}
                                                        {new Date(
                                                            order.created_at,
                                                        ).toLocaleDateString(
                                                            'en-GB',
                                                        )}
                                                    </div>

                                                    {order.status ===
                                                        'pending' && (
                                                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-200/50 bg-amber-50 px-2 py-1 shadow-sm">
                                                            <Hourglass
                                                                size={10}
                                                                className="animate-pulse text-amber-500"
                                                            />
                                                            <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                                                                <AdminOrderCountdown
                                                                    createdAt={
                                                                        order.created_at
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-base font-black text-emerald-600">
                                                        Rp{' '}
                                                        {formatCurrency(
                                                            order.total_amount,
                                                        )}
                                                    </div>
                                                    <div className="mt-1.5">
                                                        {getStatusBadge(
                                                            order.status,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* --- SMART EXPANDABLE PRODUCT LIST FOR MOBILE --- */}
                                            <div className="mt-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 ring-inset">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                        Purchased Items
                                                    </p>
                                                    {hasMultipleItems && (
                                                        <button
                                                            onClick={() =>
                                                                toggleRow(
                                                                    order.id,
                                                                )
                                                            }
                                                            className="flex items-center gap-1 text-[11px] font-bold text-purple-600 transition-colors hover:text-purple-800"
                                                        >
                                                            {isExpanded
                                                                ? 'Hide'
                                                                : 'View All'}
                                                            <ChevronRight
                                                                size={12}
                                                                className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                            />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-3">
                                                    {isExpanded ||
                                                    !hasMultipleItems ? (
                                                        // Show all items (if expanded or only 1 exists)
                                                        order.items?.map(
                                                            (
                                                                item: any,
                                                                idx: number,
                                                            ) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-start justify-between gap-2"
                                                                >
                                                                    <div className="flex items-start gap-2">
                                                                        <Package
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="mt-0.5 shrink-0 text-slate-400"
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                <span className="line-clamp-2 text-sm font-medium text-slate-700">
                                                                                    {item.title ||
                                                                                        item
                                                                                            .product
                                                                                            ?.title ||
                                                                                        'Archived Product'}
                                                                                </span>
                                                                                {(item
                                                                                    .product
                                                                                    ?.deleted_at ||
                                                                                    !item.product) && (
                                                                                    <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                                        Removed
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
                                                                                <span>
                                                                                    Seller:{' '}
                                                                                    {item
                                                                                        .product
                                                                                        ?.seller
                                                                                        ?.name ||
                                                                                        'Unknown'}
                                                                                </span>
                                                                                {item
                                                                                    .product
                                                                                    ?.seller
                                                                                    ?.username && (
                                                                                    <span className="font-medium">
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
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="shrink-0 text-xs font-bold text-slate-900">
                                                                        Rp{' '}
                                                                        {formatCurrency(
                                                                            item.price,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )
                                                    ) : (
                                                        // Show compressed view (if multiple items exist but not expanded)
                                                        <div className="flex flex-col items-start gap-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Package
                                                                    size={14}
                                                                    className="shrink-0 text-slate-400"
                                                                />
                                                                <span className="line-clamp-1 text-sm font-medium text-slate-700">
                                                                    {order
                                                                        .items[0]
                                                                        .title ||
                                                                        order
                                                                            .items[0]
                                                                            .product
                                                                            ?.title ||
                                                                        'Archived Product'}
                                                                </span>

                                                                {archivedItemsCount >
                                                                    0 && (
                                                                    <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                        {order
                                                                            .items
                                                                            .length ===
                                                                        1
                                                                            ? 'Removed'
                                                                            : `${archivedItemsCount} Removed`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-100/50 px-2 py-1 text-[11px] font-bold text-purple-600">
                                                                <PackageOpen
                                                                    size={12}
                                                                />
                                                                +{' '}
                                                                {order.items
                                                                    .length -
                                                                    1}{' '}
                                                                more items
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-auto flex justify-end border-t border-slate-100 pt-4">
                                                {order.status === 'pending' ? (
                                                    <button
                                                        onClick={() =>
                                                            promptCancel(
                                                                order.id,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
                                                    >
                                                        <X size={14} /> Force
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {order.status ===
                                                        'success'
                                                            ? 'Automated'
                                                            : 'Closed'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* --- 2. DESKTOP TABLE VIEW --- */}
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-white text-slate-500">
                                            <th className="w-12 px-5 py-5"></th>
                                            <th className="px-5 py-5 font-bold tracking-wider uppercase">
                                                Order ID / Date
                                            </th>
                                            <th className="px-5 py-5 font-bold tracking-wider uppercase">
                                                Buyer
                                            </th>
                                            <th className="px-5 py-5 font-bold tracking-wider uppercase">
                                                Products
                                            </th>
                                            <th className="px-5 py-5 font-bold tracking-wider uppercase">
                                                Seller
                                            </th>
                                            <th className="px-5 py-5 font-bold tracking-wider uppercase">
                                                Total Amount
                                            </th>
                                            <th className="px-5 py-5 font-bold tracking-wider uppercase">
                                                Status
                                            </th>
                                            <th className="px-5 py-5 text-right font-bold tracking-wider uppercase">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.data.map((order: any) => {
                                            const isExpanded =
                                                expandedOrderId === order.id;
                                            const hasMultipleItems =
                                                order.items &&
                                                order.items.length > 1;

                                            // FIXED: We deleted `archivedItemsCount` here since the desktop view expands to show each item individually.

                                            return (
                                                <React.Fragment key={order.id}>
                                                    <tr
                                                        className={`transition-colors ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'} ${order.status === 'cancelled' ? 'opacity-75 grayscale' : ''}`}
                                                    >
                                                        {/* Expand Chevron Column */}
                                                        <td className="w-12 px-5 py-5 align-top">
                                                            {hasMultipleItems && (
                                                                <button
                                                                    onClick={() =>
                                                                        toggleRow(
                                                                            order.id,
                                                                        )
                                                                    }
                                                                    title={
                                                                        isExpanded
                                                                            ? 'Hide details'
                                                                            : 'Show details'
                                                                    }
                                                                    className={`flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-slate-200 transition-all ${isExpanded ? 'rotate-90 bg-purple-100 shadow-sm ring-purple-300' : 'bg-white hover:bg-slate-100'}`}
                                                                >
                                                                    <ChevronRight
                                                                        size={
                                                                            14
                                                                        }
                                                                        className={`transition-colors ${isExpanded ? 'text-purple-700' : 'text-slate-400'}`}
                                                                    />
                                                                </button>
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-5 align-top">
                                                            <div className="font-bold text-slate-900">
                                                                #{order.id}
                                                            </div>
                                                            <div className="mt-0.5 text-xs text-slate-500">
                                                                {new Date(
                                                                    order.created_at,
                                                                ).toLocaleDateString(
                                                                    'en-GB',
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-5 align-top">
                                                            <div className="flex flex-col items-start">
                                                                <div className="font-medium text-slate-700">
                                                                    {order.buyer
                                                                        ? order
                                                                              .buyer
                                                                              .name
                                                                        : 'Guest'}
                                                                </div>
                                                                {order.buyer
                                                                    ?.username && (
                                                                    <div className="mt-0.5 text-[11px] text-slate-400">
                                                                        @
                                                                        {
                                                                            order
                                                                                .buyer
                                                                                .username
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-5 align-top">
                                                            <div className="flex flex-col items-start gap-1.5">
                                                                {order.items &&
                                                                    order.items
                                                                        .length >
                                                                        0 && (
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <Package
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="shrink-0 text-slate-400"
                                                                            />

                                                                            <span
                                                                                className="max-w-45 truncate text-sm font-medium text-slate-700"
                                                                                title={
                                                                                    order
                                                                                        .items[0]
                                                                                        .title ||
                                                                                    order
                                                                                        .items[0]
                                                                                        .product
                                                                                        ?.title
                                                                                }
                                                                            >
                                                                                {order
                                                                                    .items[0]
                                                                                    .title ||
                                                                                    order
                                                                                        .items[0]
                                                                                        .product
                                                                                        ?.title ||
                                                                                    'Archived Product'}
                                                                            </span>

                                                                            {(order
                                                                                .items[0]
                                                                                .product
                                                                                ?.deleted_at ||
                                                                                !order
                                                                                    .items[0]
                                                                                    .product) && (
                                                                                <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                                    Removed
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                {hasMultipleItems && (
                                                                    <span className="mt-1 text-[10px] font-medium text-slate-400 italic">
                                                                        +
                                                                        Various
                                                                        Creators
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-3.5 font-medium text-indigo-600">
                                                            <div className="flex flex-col">
                                                                <span>
                                                                    {order
                                                                        .items[0]
                                                                        .product
                                                                        ?.seller
                                                                        ?.name ||
                                                                        'Unknown'}
                                                                </span>
                                                                {order.items[0]
                                                                    .product
                                                                    ?.seller
                                                                    ?.username && (
                                                                    <span className="mt-0.5 text-[10px] font-normal text-slate-400">
                                                                        @
                                                                        {
                                                                            order
                                                                                .items[0]
                                                                                .product
                                                                                .seller
                                                                                .username
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-5 align-top text-base font-black text-emerald-600">
                                                            Rp{' '}
                                                            {formatCurrency(
                                                                order.total_amount,
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-5 align-top">
                                                            <div className="flex flex-col items-start gap-2">
                                                                {getStatusBadge(
                                                                    order.status,
                                                                )}

                                                                {order.status ===
                                                                    'pending' && (
                                                                    <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-100 bg-amber-50/80 px-2 py-0.5 shadow-sm">
                                                                        <Hourglass
                                                                            size={
                                                                                10
                                                                            }
                                                                            className="animate-pulse text-amber-500"
                                                                        />
                                                                        <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                                                                            <AdminOrderCountdown
                                                                                createdAt={
                                                                                    order.created_at
                                                                                }
                                                                            />
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-5 text-right align-top">
                                                            {order.status ===
                                                            'pending' ? (
                                                                <button
                                                                    onClick={() =>
                                                                        promptCancel(
                                                                            order.id,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
                                                                >
                                                                    <X
                                                                        size={
                                                                            14
                                                                        }
                                                                    />{' '}
                                                                    Force Cancel
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs font-medium text-slate-400">
                                                                    {order.status ===
                                                                    'success'
                                                                        ? 'Automated'
                                                                        : 'Closed'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>

                                                    {/* --- DESKTOP NESTED DETAILS ROW --- */}
                                                    {isExpanded &&
                                                        hasMultipleItems && (
                                                            <tr>
                                                                <td
                                                                    colSpan={8}
                                                                    className="border-t border-slate-100/50 bg-slate-50/50 p-0"
                                                                >
                                                                    <div className="py-6 pr-6 pl-17">
                                                                        <div className="relative overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm ring-1 ring-slate-900/5">
                                                                            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-purple-500"></div>
                                                                            <table className="w-full text-left text-xs whitespace-nowrap">
                                                                                <thead className="bg-slate-50/80">
                                                                                    <tr className="border-b border-slate-100 text-slate-500">
                                                                                        <th className="px-6 py-3.5 font-bold tracking-wider uppercase">
                                                                                            Item
                                                                                            Ref
                                                                                        </th>
                                                                                        <th className="px-6 py-3.5 font-bold tracking-wider uppercase">
                                                                                            Product
                                                                                            Title
                                                                                        </th>
                                                                                        <th className="px-6 py-3.5 font-bold tracking-wider uppercase">
                                                                                            Seller
                                                                                        </th>
                                                                                        <th className="px-6 py-3.5 text-right font-bold tracking-wider uppercase">
                                                                                            Price
                                                                                        </th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-slate-100">
                                                                                    {order.items.map(
                                                                                        (
                                                                                            item: any,
                                                                                            idx: number,
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    idx
                                                                                                }
                                                                                                className="transition-colors hover:bg-slate-50/50"
                                                                                            >
                                                                                                <td className="px-6 py-3.5 font-mono text-[11px] font-bold text-slate-400">
                                                                                                    #
                                                                                                    {item.id ||
                                                                                                        idx}
                                                                                                </td>
                                                                                                <td className="max-w-75 px-6 py-3.5">
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <span
                                                                                                            className="truncate font-semibold text-slate-700"
                                                                                                            title={
                                                                                                                item.title ||
                                                                                                                item
                                                                                                                    .product
                                                                                                                    ?.title
                                                                                                            }
                                                                                                        >
                                                                                                            {item.title ||
                                                                                                                item
                                                                                                                    .product
                                                                                                                    ?.title ||
                                                                                                                'Archived Product'}
                                                                                                        </span>
                                                                                                        {(item
                                                                                                            .product
                                                                                                            ?.deleted_at ||
                                                                                                            !item.product) && (
                                                                                                            <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                                                                Removed
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="px-6 py-3.5 font-medium text-indigo-600">
                                                                                                    <div className="flex flex-col">
                                                                                                        <span>
                                                                                                            {item
                                                                                                                .product
                                                                                                                ?.seller
                                                                                                                ?.name ||
                                                                                                                'Unknown'}
                                                                                                        </span>
                                                                                                        {item
                                                                                                            .product
                                                                                                            ?.seller
                                                                                                            ?.username && (
                                                                                                            <span className="mt-0.5 text-[10px] font-normal text-slate-400">
                                                                                                                @
                                                                                                                {
                                                                                                                    item
                                                                                                                        .product
                                                                                                                        .seller
                                                                                                                        .username
                                                                                                                }
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="px-6 py-3.5 text-right font-bold text-slate-900">
                                                                                                    Rp{' '}
                                                                                                    {formatCurrency(
                                                                                                        item.price,
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ),
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {orders.links && orders.links.length > 3 && (
                        <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-6 sm:px-8">
                            <div className="flex flex-wrap justify-center gap-2">
                                {orders.links.map(
                                    (link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            preserveScroll
                                            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition-all ${link.active ? 'bg-slate-900 text-white' : !link.url ? 'opacity-50' : 'bg-white text-slate-600 ring-1 ring-slate-200/60 hover:bg-slate-50'}`}
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

            {/* --- CANCEL CONFIRMATION MODAL --- */}
            <ConfirmModal
                isOpen={cancelModalConfig.isOpen}
                onClose={() =>
                    setCancelModalConfig({ isOpen: false, orderId: null })
                }
                onConfirm={executeCancel}
                title="Force Cancel Order"
                message="Are you sure you want to forcefully cancel this order? This will cancel the transaction in Midtrans and permanently close the order for the buyer."
                confirmText="Yes, cancel order"
                variant="danger"
                isProcessing={isProcessing}
            />
        </div>
    );
}
