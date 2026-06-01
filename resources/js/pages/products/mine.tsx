import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    PackageOpen,
    Edit,
    ExternalLink,
    EyeOff,
    Eye,
    Trash2,
    Search,
    Download,
    AlertCircle,
    Filter,
    ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import BackToTop from '@/components/back-to-top';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

export default function Mine({ products }: any) {
    const { t } = useTranslation(); // Inject translator here

    const productList = products?.data || products || [];

    const { flash } = usePage().props as any;

    // --- SEARCH & FILTER STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'hidden', 'locked'

    // --- NEW: Manual Processing State ---
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Listen for Flash Messages and trigger Toast ---
    useEffect(() => {
        if (flash?.success) toast(flash.success, 'success');

        if (flash?.error) toast(flash.error, 'error');

        if (flash?.success || flash?.error) {
            const currentState = window.history.state;

            if (currentState?.page?.props?.flash) {
                const newState = JSON.parse(JSON.stringify(currentState));
                newState.page.props.flash.success = null;
                newState.page.props.flash.error = null;
                window.history.replaceState(newState, '', window.location.href);
            }
        }
    }, [flash]);

    // --- REAL-TIME FILTERING ---
    const filteredProducts = productList.filter((product: any) => {
        const matchesSearch = product.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        let matchesStatus = true;

        if (statusFilter === 'active') {
            matchesStatus = product.is_active && !product.is_locked;
        } else if (statusFilter === 'hidden') {
            matchesStatus = !product.is_active && !product.is_locked;
        } else if (statusFilter === 'locked') {
            matchesStatus = product.is_locked === true;
        }

        return matchesSearch && matchesStatus;
    });

    // --- MODAL STATE MANAGEMENT ---
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        action: 'delete' | 'toggle' | null;
        product: any | null;
    }>({
        isOpen: false,
        action: null,
        product: null,
    });

    const promptDelete = (product: any) => {
        setModalConfig({ isOpen: true, action: 'delete', product });
    };

    const promptToggle = (product: any) => {
        setModalConfig({ isOpen: true, action: 'toggle', product });
    };

    const executeAction = () => {
        const { action, product } = modalConfig;

        if (!product) return;

        setIsProcessing(true);

        if (action === 'delete') {
            router.delete(`/seller/products/${product.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setModalConfig({
                        isOpen: false,
                        action: null,
                        product: null,
                    });
                },
                onFinish: () => setIsProcessing(false),
            });
        } else if (action === 'toggle') {
            router.patch(
                `/seller/products/${product.id}/toggle`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setModalConfig({
                            isOpen: false,
                            action: null,
                            product: null,
                        });
                    },
                    onFinish: () => setIsProcessing(false),
                },
            );
        }
    };

    const getModalText = () => {
        if (modalConfig.action === 'delete') {
            return {
                title: t('Delete Product'),
                message: t(
                    'Are you sure you want to permanently delete ":title"? This action cannot be undone and the file will be removed from the server.',
                ).replace(':title', modalConfig.product?.title || ''),
                confirmText: t('Yes, delete it'),
                variant: 'danger' as const,
            };
        }

        if (modalConfig.action === 'toggle') {
            const isHiding = modalConfig.product?.is_active;

            return {
                title: isHiding ? t('Hide Product?') : t('Publish Product?'),
                message: isHiding
                    ? t(
                          'Are you sure you want to hide ":title"? It will no longer be visible to buyers.',
                      ).replace(':title', modalConfig.product?.title || '')
                    : t(
                          'Are you sure you want to publish ":title"? It will instantly become visible on your store.',
                      ).replace(':title', modalConfig.product?.title || ''),
                confirmText: isHiding
                    ? t('Yes, hide it')
                    : t('Yes, publish it'),
                variant: isHiding ? ('neutral' as const) : ('primary' as const),
            };
        }

        return {
            title: '',
            message: '',
            confirmText: '',
            variant: 'danger' as const,
        };
    };

    const {
        title: modalTitle,
        message: modalMessage,
        confirmText: modalConfirmText,
        variant: modalVariant,
    } = getModalText();

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
            <Head title={t('Seller Dashboard - Soko')} />

            <Navbar />

            <main className="relative z-10 flex-1 pt-32 pb-24">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                {t('Creator Hub')}
                            </h1>
                            <p className="mt-2 text-lg text-slate-500">
                                {t(
                                    'Manage your digital products and inventory.',
                                )}
                            </p>
                        </div>

                        <Link
                            href={route('products.create')}
                            className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25"
                        >
                            <Plus size={18} />
                            {t('Add Product')}
                        </Link>
                    </div>

                    {/* --- INVENTORY SECTION --- */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5 ring-white">
                        {/* --- Search & Filter Header --- */}
                        <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
                            <h2 className="text-xl font-black text-slate-900">
                                {t('My Products')}
                            </h2>
                            {productList.length > 0 && (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    {/* Status Filter */}
                                    <div className="flex w-full items-center gap-2 sm:w-auto">
                                        <Filter
                                            size={18}
                                            className="shrink-0 text-slate-400"
                                        />
                                        <div className="relative w-full sm:w-44">
                                            <select
                                                value={statusFilter}
                                                onChange={(e) =>
                                                    setStatusFilter(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-10 pl-4 text-sm font-medium text-slate-700 shadow-sm transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            >
                                                <option value="all">
                                                    {t('All Statuses')}
                                                </option>
                                                <option value="active">
                                                    {t('Active')}
                                                </option>
                                                <option value="hidden">
                                                    {t('Hidden')}
                                                </option>
                                                <option value="locked">
                                                    {t('Locked by Admin')}
                                                </option>
                                            </select>
                                            {/* --- CUSTOM CHEVRON --- */}
                                            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative w-full sm:w-64">
                                        <Search
                                            size={18}
                                            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder={t(
                                                'Search products...',
                                            )}
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm font-medium text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {productList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/50">
                                    <PackageOpen className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {t('No products yet')}
                                </h3>
                                <p className="mt-1 max-w-sm px-4 text-slate-500">
                                    {t(
                                        'You haven\'t added any digital products to your store. Click the "New Product" button to get started.',
                                    )}
                                </p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/50">
                                    <Search className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {t('No matching products')}
                                </h3>
                                <p className="mt-1 max-w-sm px-4 text-slate-500">
                                    {t(
                                        "We couldn't find anything matching your search or filter.",
                                    )}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full">
                                {/* === MOBILE CARD VIEW === */}
                                <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                                    {filteredProducts.map((product: any) => (
                                        <div
                                            key={`mobile-${product.id}`}
                                            className={`flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 ${product.is_locked ? 'opacity-75' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">
                                                        {product.title}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {product.category
                                                            ?.name ||
                                                            t('Digital Asset')}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${
                                                        product.is_locked
                                                            ? 'bg-rose-50 text-rose-700 ring-rose-500/20'
                                                            : product.is_active
                                                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20'
                                                              : 'bg-slate-100 text-slate-600 ring-slate-500/20'
                                                    }`}
                                                >
                                                    {product.is_locked
                                                        ? t('Disabled by Admin')
                                                        : product.is_active
                                                          ? t('Active')
                                                          : t('Hidden')}
                                                </span>
                                            </div>

                                            <div>
                                                {product.is_discount_active ? (
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-black text-rose-600">
                                                                Rp{' '}
                                                                {Math.round(
                                                                    Number(
                                                                        product.discount_price,
                                                                    ),
                                                                ).toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </span>
                                                            <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-rose-600 uppercase">
                                                                {t('SALE')}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-400 line-through">
                                                            Rp{' '}
                                                            {Number(
                                                                product.price,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="text-lg font-black text-slate-700">
                                                        Rp{' '}
                                                        {Number(
                                                            product.price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-5 gap-2 border-t border-slate-200/60 pt-4">
                                                <button
                                                    onClick={() => {
                                                        if (!product.is_locked)
                                                            promptToggle(
                                                                product,
                                                            );
                                                    }}
                                                    disabled={product.is_locked}
                                                    className={`flex items-center justify-center rounded-xl py-3 transition-colors ${
                                                        product.is_locked
                                                            ? 'cursor-not-allowed bg-slate-100 text-slate-300'
                                                            : product.is_active
                                                              ? 'bg-amber-50 text-amber-600'
                                                              : 'bg-emerald-50 text-emerald-600'
                                                    }`}
                                                >
                                                    {product.is_active ? (
                                                        <EyeOff size={18} />
                                                    ) : (
                                                        <Eye size={18} />
                                                    )}
                                                </button>
                                                <Link
                                                    href={`/seller/products/${product.id}/edit`}
                                                    className="flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <a
                                                    href={`/products/${product.id}/download`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors hover:bg-sky-100"
                                                    title={t(
                                                        'Download Product File',
                                                    )}
                                                >
                                                    <Download size={18} />
                                                </a>
                                                <Link
                                                    href={`/products/${product.slug}`}
                                                    className="flex items-center justify-center rounded-xl bg-slate-200/50 text-slate-700 transition-colors hover:bg-slate-200"
                                                >
                                                    <ExternalLink size={18} />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        promptDelete(product)
                                                    }
                                                    className="flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* === DESKTOP TABLE VIEW === */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-white text-slate-500">
                                                <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                    {t('Product Detail')}
                                                </th>
                                                <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                    {t('Price')}
                                                </th>
                                                <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                    {t('Status')}
                                                </th>
                                                <th className="px-8 py-5 text-right font-bold tracking-wider uppercase">
                                                    {t('Actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredProducts.map(
                                                (product: any) => (
                                                    <tr
                                                        key={`desktop-${product.id}`}
                                                        className={`group transition-colors hover:bg-slate-50/50 ${product.is_locked ? 'bg-rose-50/30' : ''}`}
                                                    >
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                                                                    {
                                                                        product.title
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-slate-400">
                                                                    {product
                                                                        .category
                                                                        ?.name ||
                                                                        t(
                                                                            'Digital Asset',
                                                                        )}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-8 py-5">
                                                            {product.is_discount_active ? (
                                                                <div className="flex flex-col justify-center">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-rose-600">
                                                                            Rp{' '}
                                                                            {Math.round(
                                                                                Number(
                                                                                    product.discount_price,
                                                                                ),
                                                                            ).toLocaleString(
                                                                                'id-ID',
                                                                            )}
                                                                        </span>
                                                                        <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600">
                                                                            {t(
                                                                                'SALE',
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <span className="mt-0.5 text-xs font-medium text-slate-400 line-through">
                                                                        Rp{' '}
                                                                        {Number(
                                                                            product.price,
                                                                        ).toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="font-bold text-slate-600">
                                                                    Rp{' '}
                                                                    {Number(
                                                                        product.price,
                                                                    ).toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-8 py-5">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
                                                                    product.is_locked
                                                                        ? 'bg-rose-50 text-rose-700 ring-rose-500/20'
                                                                        : product.is_active
                                                                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20'
                                                                          : 'bg-slate-100 text-slate-600 ring-slate-500/20'
                                                                }`}
                                                            >
                                                                {product.is_locked ? (
                                                                    <>
                                                                        <AlertCircle
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        {t(
                                                                            'Disabled by Admin',
                                                                        )}
                                                                    </>
                                                                ) : product.is_active ? (
                                                                    <>
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                                        {t(
                                                                            'Active',
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <EyeOff
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        {t(
                                                                            'Hidden',
                                                                        )}
                                                                    </>
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        if (
                                                                            !product.is_locked
                                                                        )
                                                                            promptToggle(
                                                                                product,
                                                                            );
                                                                    }}
                                                                    disabled={
                                                                        product.is_locked
                                                                    }
                                                                    className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                                                                        product.is_locked
                                                                            ? 'cursor-not-allowed bg-slate-100 text-slate-300'
                                                                            : product.is_active
                                                                              ? 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                                                                              : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                                                                    }`}
                                                                    title={
                                                                        product.is_locked
                                                                            ? t(
                                                                                  'Disabled by Admin',
                                                                              )
                                                                            : product.is_active
                                                                              ? t(
                                                                                    'Hide Product',
                                                                                )
                                                                              : t(
                                                                                    'Publish Product',
                                                                                )
                                                                    }
                                                                >
                                                                    {product.is_active ? (
                                                                        <EyeOff
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <Eye
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    )}
                                                                </button>

                                                                <Link
                                                                    href={`/seller/products/${product.id}/edit`}
                                                                    className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                                                    title={t(
                                                                        'Edit Product',
                                                                    )}
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </Link>

                                                                <a
                                                                    href={`/products/${product.id}/download`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-600"
                                                                    title={t(
                                                                        'Download Product File',
                                                                    )}
                                                                >
                                                                    <Download
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </a>

                                                                <Link
                                                                    href={`/products/${product.slug}`}
                                                                    className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                                                                    title={t(
                                                                        'View on Store',
                                                                    )}
                                                                >
                                                                    <ExternalLink
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </Link>

                                                                <button
                                                                    onClick={() =>
                                                                        promptDelete(
                                                                            product,
                                                                        )
                                                                    }
                                                                    className="flex items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                                    title={t(
                                                                        'Delete Product',
                                                                    )}
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() =>
                    setModalConfig({
                        isOpen: false,
                        action: null,
                        product: null,
                    })
                }
                onConfirm={executeAction}
                title={modalTitle}
                message={modalMessage}
                confirmText={modalConfirmText}
                variant={modalVariant}
                isProcessing={isProcessing}
            />
            <BackToTop />
        </div>
    );
}
