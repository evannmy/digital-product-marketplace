import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Percent,
    Clock,
    Calendar,
    Zap,
    XCircle,
    CheckSquare,
    Square,
    AlertCircle,
    Search,
    Filter,
    ChevronDown,
    EyeOff,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import BackToTop from '@/components/back-to-top';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

export default function PromotionsIndex({ products }: any) {
    const { t } = useTranslation(); // Inject translator here

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // --- ADDED: Ambil flash dari Inertia ---
    const { flash } = usePage().props as any;

    // --- ADDED: Listener otomatis untuk Toast ---
    useEffect(() => {
        if (flash?.success) toast(flash.success, 'success');

        if (flash?.error) toast(flash.error, 'error');
    }, [flash]);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm({
        product_ids: [] as number[],
        discount_percentage: '',
        starts_at: '',
        ends_at: '',
        timezone: userTimeZone,
    });

    const [customHours, setCustomHours] = useState<number | ''>('');
    const [customMinutes, setCustomMinutes] = useState<number | ''>('');

    // --- UX State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<
        'all' | 'active' | 'inactive'
    >('all');
    const [showCustomDates, setShowCustomDates] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    // --- LOGIC: Duration Calculator ---
    const applyCustomDuration = () => {
        let baseTime = data.starts_at ? new Date(data.starts_at) : new Date();
        const now = new Date();

        if (baseTime < now) {
            baseTime = now;
        }

        const h = Number(customHours) || 0;
        const m = Number(customMinutes) || 0;

        const durationInMs = h * 60 * 60 * 1000 + m * 60 * 1000;
        const endTime = new Date(baseTime.getTime() + durationInMs);

        const formatForInput = (dateObj: Date) => {
            return new Date(
                dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
            )
                .toISOString()
                .slice(0, 16);
        };

        setData({
            ...data,
            starts_at: formatForInput(baseTime),
            ends_at: formatForInput(endTime),
        });

        clearErrors('starts_at', 'ends_at');
        setCustomHours('');
        setCustomMinutes('');
        toast(t('Duration calculated and applied!'), 'success');
    };

    // --- LOGIC: Real-time Search & Status Filtering ---
    const filteredProducts = products.filter((product: any) => {
        const matchesSearch = product.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'active'
                  ? product.is_discount_active
                  : !product.is_discount_active;

        return matchesSearch && matchesStatus;
    });

    const filteredIds = filteredProducts.map((p: any) => p.id);
    const isAllFilteredSelected =
        filteredIds.length > 0 &&
        filteredIds.every((id: number) => data.product_ids.includes(id));

    // --- LOGIC: Selection ---
    const toggleProduct = (id: number) => {
        const selected = data.product_ids;

        if (selected.includes(id)) {
            setData(
                'product_ids',
                selected.filter((item) => item !== id),
            );
        } else {
            setData('product_ids', [...selected, id]);
        }
    };

    const toggleAll = () => {
        if (isAllFilteredSelected) {
            setData(
                'product_ids',
                data.product_ids.filter((id) => !filteredIds.includes(id)),
            );
        } else {
            const newSelection = new Set([...data.product_ids, ...filteredIds]);
            setData('product_ids', Array.from(newSelection));
        }
    };

    // --- LOGIC: Submission ---
    const submitPromotion = (e: React.FormEvent) => {
        e.preventDefault();

        // SMART UX INTERCEPTION: Kalkulasi otomatis jika pengguna lupa klik "Add"
        transform((currentData) => {
            if (customHours !== '' || customMinutes !== '') {
                const now = new Date();
                const h = Number(customHours) || 0;
                const m = Number(customMinutes) || 0;

                const durationInMs = h * 60 * 60 * 1000 + m * 60 * 1000;
                const endTime = new Date(now.getTime() + durationInMs);

                const formatForInput = (dateObj: Date) => {
                    return new Date(
                        dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
                    )
                        .toISOString()
                        .slice(0, 16);
                };

                return {
                    ...currentData,
                    starts_at: formatForInput(now),
                    ends_at: formatForInput(endTime),
                };
            }

            return currentData;
        });

        post(route('promotions.apply'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset(
                    'discount_percentage',
                    'starts_at',
                    'ends_at',
                    'product_ids',
                );
                setShowCustomDates(false);
                setCustomHours('');
                setCustomMinutes('');
            },
            onError: (err) => {
                console.error('Backend Validation Failed:', err);
                toast(
                    t('Failed to apply. Check the form for errors.'),
                    'error',
                );
            },
        });
    };

    const confirmClearPromotion = () => {
        const idsToClear = selectedProductsWithPromos.map((p: any) => p.id);

        router.post(
            route('promotions.clear'),
            { product_ids: idsToClear },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsClearModalOpen(false);
                    reset('product_ids');
                },
                onError: (err) => {
                    console.error('Backend Validation Failed:', err);
                    toast(t('Failed to clear discounts.'), 'error');
                },
            },
        );
    };

    // --- LIVE PREVIEW MATH ---
    const discountValue = Number(data.discount_percentage) || 0;
    const selectedProducts = products.filter((p: any) =>
        data.product_ids.includes(p.id),
    );
    const selectedProductsWithPromos = selectedProducts.filter(
        (p: any) => p.is_discount_active,
    );

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return t('Not set');

        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] pb-24 font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900 sm:pb-0">
            <Head title={t('Manage Promotions - Soko')} />

            <Navbar />

            <main className="relative z-10 pt-32 pb-24">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                {t('Promotions')}
                            </h1>
                            <p className="mt-2 text-lg text-slate-500">
                                {t(
                                    'Create flash sales and manage bulk discounts for your products.',
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                        {/* ========================================================= */}
                        {/* LEFT SIDE: The Campaign Form                              */}
                        {/* ========================================================= */}
                        <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-xl ring-1 shadow-purple-900/5 backdrop-blur-xl lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:w-105">
                            <form
                                onSubmit={submitPromotion}
                                className="flex min-h-0 w-full flex-1 flex-col"
                            >
                                {/* Form Header */}
                                <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-6 py-5 backdrop-blur-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                            <Zap
                                                size={20}
                                                className="fill-current"
                                            />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900">
                                            {t('Create Flash Sale')}
                                        </h3>
                                    </div>
                                </div>

                                {/* Scrollable Form Content */}
                                <div className="flex-1 space-y-6 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent">
                                    {/* 1. Discount Input */}
                                    <div>
                                        <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <Percent
                                                size={16}
                                                className="text-slate-400"
                                            />
                                            {t('Discount Percentage')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={data.discount_percentage}
                                                onChange={(e) =>
                                                    setData(
                                                        'discount_percentage',
                                                        e.target.value,
                                                    )
                                                }
                                                className={`w-full rounded-xl border bg-white/50 px-4 py-3 pr-10 text-sm shadow-sm transition-colors focus:bg-white focus:ring-1 focus:outline-none ${errors.discount_percentage ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500'} [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                                                placeholder={t('e.g. 20')}
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                <span className="font-bold text-slate-400">
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                        {errors.discount_percentage && (
                                            <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                                <AlertCircle size={12} />{' '}
                                                {errors.discount_percentage}
                                            </p>
                                        )}

                                        {/* Live Math Preview */}
                                        {discountValue > 0 &&
                                            discountValue < 100 &&
                                            selectedProducts.length > 0 && (
                                                <div className="mt-4 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50">
                                                    <div className="bg-emerald-100/50 px-4 py-2.5 text-xs font-bold tracking-wider text-emerald-800 uppercase">
                                                        {t('Price Preview')} (
                                                        {
                                                            selectedProducts.length
                                                        }{' '}
                                                        {t('items')})
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto p-4">
                                                        <ul className="space-y-3">
                                                            {selectedProducts.map(
                                                                (
                                                                    product: any,
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        className="flex items-center justify-between border-b border-emerald-100 pb-2 last:border-0 last:pb-0"
                                                                    >
                                                                        <span className="truncate pr-4 text-sm font-semibold text-emerald-900">
                                                                            {
                                                                                product.title
                                                                            }
                                                                        </span>
                                                                        <div className="flex shrink-0 flex-col items-end">
                                                                            <span className="text-[10px] font-bold text-slate-400 line-through">
                                                                                Rp{' '}
                                                                                {Number(
                                                                                    product.price,
                                                                                ).toLocaleString(
                                                                                    'id-ID',
                                                                                )}
                                                                            </span>
                                                                            <span className="text-sm font-black text-emerald-600">
                                                                                Rp{' '}
                                                                                {Math.round(
                                                                                    product.price *
                                                                                        (1 -
                                                                                            discountValue /
                                                                                                100),
                                                                                ).toLocaleString(
                                                                                    'id-ID',
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                    </div>

                                    {/* 2. Schedule Section */}
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                                <Clock
                                                    size={16}
                                                    className="text-slate-400"
                                                />
                                                {t('Timezone')}
                                            </label>
                                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                                                {userTimeZone}
                                            </span>
                                        </div>

                                        {/* Primary Duration Calculator */}
                                        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                            <label className="mb-2 block text-xs font-bold text-slate-500">
                                                {t('Set Time Duration')}
                                            </label>
                                            <div className="flex items-end gap-2">
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={customHours}
                                                        onChange={(e) =>
                                                            setCustomHours(
                                                                e.target
                                                                    .value ===
                                                                    ''
                                                                    ? ''
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors [-moz-appearance:textfield] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                        placeholder={t('Hours')}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="59"
                                                        value={customMinutes}
                                                        onChange={(e) =>
                                                            setCustomMinutes(
                                                                e.target
                                                                    .value ===
                                                                    ''
                                                                    ? ''
                                                                    : Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ),
                                                            )
                                                        }
                                                        className="block w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors [-moz-appearance:textfield] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                        placeholder={t(
                                                            'Minutes',
                                                        )}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={
                                                        applyCustomDuration
                                                    }
                                                    disabled={
                                                        !customHours &&
                                                        !customMinutes
                                                    }
                                                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-700 hover:shadow-md disabled:opacity-30"
                                                >
                                                    {t('Set')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Active Schedule Summary */}
                                        {(data.starts_at || data.ends_at) && (
                                            <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                                                <div className="mb-1 flex justify-between text-xs">
                                                    <span className="font-semibold text-purple-900">
                                                        {t('Starts:')}
                                                    </span>
                                                    <span className="text-purple-700">
                                                        {formatDisplayDate(
                                                            data.starts_at,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-semibold text-purple-900">
                                                        {t('Ends:')}
                                                    </span>
                                                    <span className="text-purple-700">
                                                        {formatDisplayDate(
                                                            data.ends_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Progressive Disclosure: Custom Dates Toggle */}
                                        {!showCustomDates ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCustomDates(true)
                                                }
                                                className="w-full py-2 text-center text-xs font-bold text-slate-400 transition-colors hover:text-purple-600"
                                            >
                                                {t('Set using date')}
                                            </button>
                                        ) : (
                                            <div className="flex animate-in flex-col gap-4 duration-200 fade-in slide-in-from-top-2">
                                                <div className="border-t border-slate-100 pt-4">
                                                    <label className="mb-1.5 block text-xs font-bold text-slate-500">
                                                        {t('Starts At')}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="datetime-local"
                                                            value={
                                                                data.starts_at
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'starts_at',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                                        />
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                                                            <Calendar
                                                                size={18}
                                                            />
                                                        </div>
                                                    </div>
                                                    {errors.starts_at && (
                                                        <p className="mt-1 text-[10px] text-rose-500">
                                                            {errors.starts_at}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-bold text-slate-500">
                                                        {t('Ends At')}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="datetime-local"
                                                            value={data.ends_at}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'ends_at',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                                        />
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                                                            <Calendar
                                                                size={18}
                                                            />
                                                        </div>
                                                    </div>
                                                    {errors.ends_at && (
                                                        <p className="mt-1 text-[10px] text-rose-500">
                                                            {errors.ends_at}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowCustomDates(
                                                            false,
                                                        )
                                                    }
                                                    className="mt-2 text-xs font-bold text-slate-400 transition-colors hover:text-slate-600"
                                                >
                                                    {t('Hide date settings')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* --- LAUNCH BUTTON --- */}
                                <div className="z-10 shrink-0 border-t border-slate-100 bg-white/90 p-4 backdrop-blur-md sm:p-5 sm:px-6">
                                    <button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            data.product_ids.length === 0
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                    >
                                        {t('Apply to')}{' '}
                                        {data.product_ids.length}{' '}
                                        {t('Product(s)')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* ========================================================= */}
                        {/* RIGHT SIDE: Product List & Bulk Management                */}
                        {/* ========================================================= */}
                        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5 ring-white lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)]">
                            {/* Header, Search, Filter, and Bulk Clear Action */}
                            <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 sm:px-8 sm:py-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900">
                                        {t('Select Products')}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={toggleAll}
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                                    >
                                        {isAllFilteredSelected
                                            ? t('Deselect All')
                                            : t('Select All')}
                                    </button>
                                </div>

                                {/* Search and Filters */}
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <Search
                                            size={18}
                                            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder={t(
                                                'Search products by title...',
                                            )}
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm font-medium text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div className="relative shrink-0 sm:w-44">
                                        <Filter
                                            size={16}
                                            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                        />
                                        <select
                                            value={filterStatus}
                                            onChange={(e) =>
                                                setFilterStatus(
                                                    e.target.value as any,
                                                )
                                            }
                                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-9 text-sm font-medium text-slate-700 transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        >
                                            <option value="all">
                                                {t('All Products')}
                                            </option>
                                            <option value="active">
                                                {t('Active Promo')}
                                            </option>
                                            <option value="inactive">
                                                {t('No Promo')}
                                            </option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>

                                    {selectedProductsWithPromos.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsClearModalOpen(true)
                                            }
                                            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100"
                                        >
                                            <XCircle size={16} />
                                            {t('Remove Discounts')} (
                                            {selectedProductsWithPromos.length})
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable Product Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {filteredProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/50">
                                            <Search className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            {t('No matching products')}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {t(
                                                'Try adjusting your search or filters.',
                                            )}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {filteredProducts.map(
                                            (product: any) => {
                                                const isSelected =
                                                    data.product_ids.includes(
                                                        product.id,
                                                    );

                                                return (
                                                    <div
                                                        key={`product-${product.id}`}
                                                        onClick={() =>
                                                            toggleProduct(
                                                                product.id,
                                                            )
                                                        }
                                                        className={`group relative flex cursor-pointer flex-col justify-between gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${
                                                            isSelected
                                                                ? 'bg-purple-50/50 shadow-md ring-2 shadow-purple-500/10 ring-purple-500'
                                                                : 'bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-lg hover:shadow-purple-500/10 hover:ring-purple-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex flex-col pr-8">
                                                                <span className="line-clamp-2 leading-tight font-bold text-slate-900">
                                                                    {
                                                                        product.title
                                                                    }
                                                                </span>

                                                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                                    <span className="text-sm font-semibold text-slate-500">
                                                                        Rp{' '}
                                                                        {Number(
                                                                            product.price,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>

                                                                    {/* Suspended by Admin Indicator */}
                                                                    {product.is_locked && (
                                                                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-rose-800 uppercase ring-1 ring-rose-300 ring-inset">
                                                                            <AlertCircle
                                                                                size={
                                                                                    12
                                                                                }
                                                                                className="shrink-0"
                                                                            />{' '}
                                                                            {t(
                                                                                'Suspended',
                                                                            )}
                                                                        </span>
                                                                    )}

                                                                    {/* Hidden by Seller Indicator */}
                                                                    {!product.is_active &&
                                                                        !product.is_locked && (
                                                                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase ring-1 ring-amber-300 ring-inset">
                                                                                <EyeOff
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                    className="shrink-0"
                                                                                />{' '}
                                                                                {t(
                                                                                    'Hidden',
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </div>

                                                            <div className="absolute top-5 right-5">
                                                                {isSelected ? (
                                                                    <CheckSquare
                                                                        size={
                                                                            22
                                                                        }
                                                                        className="text-purple-600"
                                                                    />
                                                                ) : (
                                                                    <Square
                                                                        size={
                                                                            22
                                                                        }
                                                                        className="text-slate-300 transition-colors group-hover:text-purple-400"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 border-t border-slate-100 pt-4">
                                                            {product.is_discount_active ? (
                                                                <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-100">
                                                                    <Zap
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="fill-current"
                                                                    />
                                                                    {t(
                                                                        'Promo Price:',
                                                                    )}{' '}
                                                                    Rp{' '}
                                                                    {Math.round(
                                                                        Number(
                                                                            product.discount_price,
                                                                        ),
                                                                    ).toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs font-medium text-slate-400">
                                                                    {t(
                                                                        'No active promo',
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals & Toasts */}
            <ConfirmModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={confirmClearPromotion}
                title={t('Remove Discounts')}
                message={t(
                    'Are you sure you want to completely remove the active discounts from the :count valid selected product(s)?',
                ).replace(
                    ':count',
                    selectedProductsWithPromos.length.toString(),
                )}
                confirmText={t('Yes, clear discounts')}
                variant="danger"
            />

            <BackToTop />
        </div>
    );
}
