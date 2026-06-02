import { Head } from '@inertiajs/react';
import {
    ShoppingBag,
    Search,
    ChevronRight,
    PackageOpen,
    Package,
} from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/navbar';
import Pagination from '@/components/pagination';
import { useTranslation } from '@/hooks/useTranslation';

export default function Orders({ orders }: any) {
    const { t } = useTranslation();

    const orderList = orders?.data || orders || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const getBuyerName = (order: any) =>
        typeof order.buyer === 'string'
            ? order.buyer
            : order.buyer?.name || t('Unknown Buyer');

    const getBuyerUsername = (order: any) =>
        order.buyer_username || order.buyer?.username || '';

    const filteredOrders = orderList.filter((order: any) => {
        const query = searchQuery.toLowerCase();

        return (
            order.id.toLowerCase().includes(query) ||
            getBuyerName(order).toLowerCase().includes(query) ||
            getBuyerUsername(order).toLowerCase().includes(query) ||
            order.items?.some((item: any) =>
                item.title.toLowerCase().includes(query),
            )
        );
    });

    const toggleRow = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
            <Head title={t('My Sales | Soko')} />
            <Navbar />

            <main className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900">
                    {t('Sales History')}
                </h1>

                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5 ring-white">
                    <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="h-6 w-6 text-purple-600" />
                            <h2 className="text-xl font-black text-slate-900">
                                {t('Recent Transactions')}
                            </h2>
                        </div>
                        {orderList.length > 0 && (
                            <div className="relative w-full sm:max-w-xs">
                                <Search
                                    size={18}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder={t(
                                        'Search order ID, product or buyer...',
                                    )}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm font-medium text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            </div>
                        )}
                    </div>

                    {orderList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/50">
                                <ShoppingBag className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {t('No sales yet')}
                            </h3>
                            <p className="mt-1 max-w-sm px-4 text-slate-500">
                                {t(
                                    "You haven't added any digital products to your store. Keep promoting your links!",
                                )}
                            </p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/50">
                                <Search className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {t('No matching transactions')}
                            </h3>
                            <p className="mt-1 max-w-sm px-4 text-slate-500">
                                {t('We couldn\'t find anything matching "')}
                                <span className="font-semibold text-slate-700">
                                    {searchQuery}
                                </span>
                                ".
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* --- 1. MOBILE VIEW (CLEAN, STRUCTURED & DISTINCT) --- */}
                            <div className="flex flex-col sm:hidden">
                                {filteredOrders.map((order: any) => {
                                    const isExpanded =
                                        expandedOrderId === order.id;
                                    const hasMultipleItems =
                                        order.items && order.items.length > 1;
                                    const buyerName = getBuyerName(order);
                                    const buyerUsername =
                                        getBuyerUsername(order);

                                    const archivedItemsCount =
                                        order.items?.filter(
                                            (i: any) => i.is_archived,
                                        ).length || 0;

                                    return (
                                        <div
                                            key={order.id}
                                            // DITAMBAHKAN: Pemisah visual yang tebal agar tiap order mudah dibedakan
                                            className="border-b-[6px] border-slate-100/80 bg-white p-5 transition-colors last:border-0 hover:bg-slate-50"
                                        >
                                            {/* Baris 1: Order ID & Date */}
                                            <div className="mb-4 flex items-center justify-between text-[13px] font-bold tracking-widest text-slate-400 uppercase">
                                                <span>{order.id}</span>
                                                <span className="font-medium tracking-normal text-slate-400 normal-case">
                                                    {order.date}
                                                </span>
                                            </div>

                                            {/* Baris 2: Product Info & Pricing */}
                                            <div className="mb-6 flex w-full items-start justify-between">
                                                <div className="flex w-[55%] flex-col items-start gap-2 pr-2">
                                                    <div className="flex items-start gap-2">
                                                        <Package
                                                            size={18}
                                                            className="mt-0.5 shrink-0 text-slate-400"
                                                        />
                                                        {/* DIPERKECIL: Font judul produk menjadi text-sm */}
                                                        <span className="line-clamp-2 text-sm leading-snug font-bold text-slate-900">
                                                            {
                                                                order.productPreview
                                                            }
                                                        </span>
                                                    </div>

                                                    {archivedItemsCount > 0 && (
                                                        <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                            {order.items
                                                                .length === 1
                                                                ? t('Removed')
                                                                : `${archivedItemsCount} ${t('Removed')}`}
                                                        </span>
                                                    )}

                                                    {hasMultipleItems && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 ring-1 ring-purple-700/10 ring-inset">
                                                            <PackageOpen
                                                                size={12}
                                                            />
                                                            +{' '}
                                                            {order.items
                                                                .length -
                                                                1}{' '}
                                                            {t('more items')}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex w-[45%] shrink-0 flex-col items-end text-right">
                                                    <span className="text-[11px] font-medium text-slate-500">
                                                        {t('Gross:')} Rp{' '}
                                                        {Number(
                                                            order.amount,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-rose-500">
                                                        {t('Fee:')} Rp{' '}
                                                        {Number(
                                                            order.platform_fee ??
                                                                order.amount -
                                                                    order.net_amount,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                    {/* DIPERKECIL: Font nominal bersih menjadi text-sm */}
                                                    <span className="mt-1 text-sm font-black tracking-tight text-emerald-600">
                                                        {t('Net Earnings: ')} Rp{' '}
                                                        {Number(
                                                            order.net_amount,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Baris 3: Pembeli & Aksi */}
                                            <div className="flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <span className="mb-0.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                                        {t('Buyer')}
                                                    </span>
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {/* DIPERKECIL: Font nama pembeli menjadi text-sm */}
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {buyerName}
                                                        </span>
                                                        {buyerUsername && (
                                                            <span className="text-[11px] font-medium text-slate-400">
                                                                (@
                                                                {buyerUsername})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {hasMultipleItems && (
                                                    <button
                                                        onClick={() =>
                                                            toggleRow(order.id)
                                                        }
                                                        className="flex shrink-0 items-center gap-1 pb-0.5 text-xs font-bold text-purple-600 transition-colors hover:text-purple-800"
                                                    >
                                                        {isExpanded
                                                            ? t('Hide Details')
                                                            : t('View Details')}
                                                        <ChevronRight
                                                            size={14}
                                                            className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                        />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Detail Item (Jika Diekspansi) */}
                                            {isExpanded && hasMultipleItems && (
                                                <div className="mt-5 space-y-3 rounded-xl border-y border-r border-l-4 border-slate-100 border-l-purple-500 bg-slate-50/50 p-4 shadow-sm">
                                                    {order.items.map(
                                                        (item: any) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex justify-between gap-4 text-xs"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                                        <span className="line-clamp-2 font-semibold text-slate-700">
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </span>
                                                                        {item.is_archived && (
                                                                            <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                                {t(
                                                                                    'Removed',
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="mt-0.5 font-mono text-[10px] text-slate-400">
                                                                        {
                                                                            item.id
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex shrink-0 flex-col items-end">
                                                                    <span className="text-[10px] text-slate-500">
                                                                        {t(
                                                                            'Gross:',
                                                                        )}{' '}
                                                                        Rp{' '}
                                                                        {Number(
                                                                            item.price,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>
                                                                    <span className="text-[10px] text-rose-500">
                                                                        {t(
                                                                            'Fee:',
                                                                        )}{' '}
                                                                        Rp{' '}
                                                                        {Number(
                                                                            item.platform_fee ??
                                                                                item.price -
                                                                                    item.net_price,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>
                                                                    <span className="font-bold text-emerald-600">
                                                                        {t(
                                                                            'Net:',
                                                                        )}{' '}
                                                                        Rp{' '}
                                                                        {Number(
                                                                            item.net_price,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* --- 2. DESKTOP VIEW --- */}
                            <div className="hidden overflow-x-auto sm:block">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-white text-slate-400">
                                            <th className="px-5 py-5"></th>
                                            <th className="px-5 py-5 font-bold tracking-wider uppercase">
                                                {t('Order ID')}
                                            </th>
                                            <th className="px-6 py-5 font-bold tracking-wider uppercase">
                                                {t('Product')}
                                            </th>
                                            <th className="px-6 py-5 font-bold tracking-wider uppercase">
                                                {t('Buyer')}
                                            </th>
                                            <th className="px-6 py-5 font-bold tracking-wider uppercase">
                                                {t('Date')}
                                            </th>
                                            <th className="px-6 py-5 text-right font-bold tracking-wider uppercase">
                                                {t('Gross')}
                                            </th>
                                            <th className="px-6 py-5 text-right font-bold tracking-wider text-rose-500 uppercase">
                                                {t('Fee')}
                                            </th>
                                            <th className="px-6 py-5 text-right font-bold tracking-wider text-emerald-600 uppercase">
                                                {t('Net Earnings')}
                                            </th>
                                        </tr>
                                    </thead>
                                    {filteredOrders.map((order: any) => {
                                        const isExpanded =
                                            expandedOrderId === order.id;
                                        const hasMultipleItems =
                                            order.items &&
                                            order.items.length > 1;
                                        const buyerName = getBuyerName(order);
                                        const buyerUsername =
                                            getBuyerUsername(order);

                                        const archivedItemsCount =
                                            order.items?.filter(
                                                (i: any) => i.is_archived,
                                            ).length || 0;

                                        return (
                                            <tbody
                                                key={order.id}
                                                className="group divide-y divide-slate-100 border-b border-slate-100/60 last:border-0"
                                            >
                                                <tr
                                                    className={`transition-colors hover:bg-purple-50 ${isExpanded ? 'bg-slate-50/50' : 'bg-white last:border-0'}`}
                                                >
                                                    <td className="w-16 px-5 py-5 align-top">
                                                        {hasMultipleItems && (
                                                            <button
                                                                onClick={() =>
                                                                    toggleRow(
                                                                        order.id,
                                                                    )
                                                                }
                                                                title={
                                                                    isExpanded
                                                                        ? t(
                                                                              'Hide product details',
                                                                          )
                                                                        : t(
                                                                              'Show product details',
                                                                          )
                                                                }
                                                                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 transition-all ${isExpanded ? 'rotate-90 bg-purple-100 shadow-md shadow-purple-900/10 ring-purple-300' : 'hover:bg-slate-100'}`}
                                                            >
                                                                <ChevronRight
                                                                    size={16}
                                                                    className={`transition-colors ${isExpanded ? 'text-purple-900' : 'text-slate-400'}`}
                                                                />
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-5 align-top font-mono text-xs font-bold text-slate-500">
                                                        {order.id}
                                                    </td>
                                                    <td className="px-6 py-5 align-top">
                                                        <div className="flex flex-col items-start gap-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Package
                                                                    size={16}
                                                                    className="shrink-0 text-slate-400"
                                                                />
                                                                <span
                                                                    className="max-w-50 truncate font-bold text-slate-900"
                                                                    title={
                                                                        order.productPreview
                                                                    }
                                                                >
                                                                    {
                                                                        order.productPreview
                                                                    }
                                                                </span>

                                                                {archivedItemsCount >
                                                                    0 && (
                                                                    <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                        {order
                                                                            .items
                                                                            .length ===
                                                                        1
                                                                            ? t(
                                                                                  'Removed',
                                                                              )
                                                                            : `${archivedItemsCount} ${t('Removed')}`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {hasMultipleItems && (
                                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 ring-1 ring-purple-700/10 ring-inset">
                                                                    <PackageOpen
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                    +{' '}
                                                                    {order.items
                                                                        .length -
                                                                        1}{' '}
                                                                    {t(
                                                                        'more items',
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="max-w-45 truncate px-6 py-5 align-top">
                                                        <div className="flex flex-col">
                                                            <span
                                                                className="truncate font-semibold text-slate-700"
                                                                title={
                                                                    buyerName
                                                                }
                                                            >
                                                                {buyerName}
                                                            </span>
                                                            {buyerUsername && (
                                                                <span
                                                                    className="truncate text-[11px] font-medium text-slate-400"
                                                                    title={`@${buyerUsername}`}
                                                                >
                                                                    @
                                                                    {
                                                                        buyerUsername
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 align-top text-slate-500">
                                                        {order.date}
                                                    </td>
                                                    <td className="px-6 py-5 text-right align-top font-medium text-slate-500">
                                                        Rp{' '}
                                                        {Number(
                                                            order.amount,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-right align-top font-medium text-rose-500">
                                                        Rp{' '}
                                                        {Number(
                                                            order.platform_fee ??
                                                                order.amount -
                                                                    order.net_amount,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-right align-top font-black text-emerald-600">
                                                        Rp{' '}
                                                        {Number(
                                                            order.net_amount,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* DESKTOP NESTED ITEMS (Only shows if there are multiple items and expanded) */}
                                                {isExpanded &&
                                                    hasMultipleItems && (
                                                        <tr>
                                                            <td
                                                                colSpan={8}
                                                                className="border-t border-slate-100/50 bg-slate-50/50 p-0"
                                                            >
                                                                <div className="py-6 pr-6 pl-22">
                                                                    <div className="relative overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm ring-1 ring-slate-900/5">
                                                                        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-purple-500"></div>
                                                                        <table className="w-full text-left text-xs whitespace-nowrap">
                                                                            <thead className="bg-slate-50/80">
                                                                                <tr className="border-b border-slate-100 text-slate-500">
                                                                                    <th className="px-6 py-3.5 font-bold tracking-wider uppercase">
                                                                                        {t(
                                                                                            'Item Ref',
                                                                                        )}
                                                                                    </th>
                                                                                    <th className="px-6 py-3.5 font-bold tracking-wider uppercase">
                                                                                        {t(
                                                                                            'Product Title',
                                                                                        )}
                                                                                    </th>
                                                                                    <th className="px-6 py-3.5 text-right font-bold tracking-wider uppercase">
                                                                                        {t(
                                                                                            'Gross',
                                                                                        )}
                                                                                    </th>
                                                                                    <th className="px-6 py-3.5 text-right font-bold tracking-wider text-rose-500 uppercase">
                                                                                        {t(
                                                                                            'Fee',
                                                                                        )}
                                                                                    </th>
                                                                                    <th className="px-6 py-3.5 text-right font-bold tracking-wider text-emerald-600 uppercase">
                                                                                        {t(
                                                                                            'Net Earnings',
                                                                                        )}
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100">
                                                                                {order.items.map(
                                                                                    (
                                                                                        item: any,
                                                                                    ) => (
                                                                                        <tr
                                                                                            key={
                                                                                                item.id
                                                                                            }
                                                                                            className="transition-colors hover:bg-slate-50/50"
                                                                                        >
                                                                                            <td className="px-6 py-3.5 font-mono text-[11px] font-bold text-slate-400">
                                                                                                {
                                                                                                    item.id
                                                                                                }
                                                                                            </td>
                                                                                            <td className="max-w-75 px-6 py-3.5">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span
                                                                                                        className="truncate font-semibold text-slate-700"
                                                                                                        title={
                                                                                                            item.title
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            item.title
                                                                                                        }
                                                                                                    </span>
                                                                                                    {item.is_archived && (
                                                                                                        <span className="inline-flex shrink-0 items-center rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase ring-1 ring-rose-200 ring-inset">
                                                                                                            {t(
                                                                                                                'Removed',
                                                                                                            )}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                            </td>
                                                                                            <td className="px-6 py-3.5 text-right text-slate-500">
                                                                                                Rp{' '}
                                                                                                {Number(
                                                                                                    item.price,
                                                                                                ).toLocaleString(
                                                                                                    'id-ID',
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="px-6 py-3.5 text-right font-medium text-rose-500">
                                                                                                Rp{' '}
                                                                                                {Number(
                                                                                                    item.platform_fee ??
                                                                                                        item.price -
                                                                                                            item.net_price,
                                                                                                ).toLocaleString(
                                                                                                    'id-ID',
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="px-6 py-3.5 text-right font-bold text-emerald-600">
                                                                                                Rp{' '}
                                                                                                {Number(
                                                                                                    item.net_price,
                                                                                                ).toLocaleString(
                                                                                                    'id-ID',
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
                                            </tbody>
                                        );
                                    })}
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination links={orders?.links || []} />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
