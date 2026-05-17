import { Head, router } from '@inertiajs/react';
import {
    EyeOff,
    Eye,
    Trash2,
    Search,
    ExternalLink,
    Filter,
    Lock,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';

export default function Products({ products }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // --- NEW: Manual Processing State ---
    const [isProcessing, setIsProcessing] = useState(false);

    const productList = products?.data || products || [];

    // --- CLIENT-SIDE FILTERING ---
    const filteredProducts = productList.filter((product: any) => {
        const query = searchQuery.toLowerCase();

        // --- UPDATED: Now searches by product title, seller name, AND username ---
        const matchesSearch =
            product.title.toLowerCase().includes(query) ||
            (product.seller?.name &&
                product.seller.name.toLowerCase().includes(query)) ||
            (product.seller?.username &&
                product.seller.username.toLowerCase().includes(query));

        let matchesStatus = true;

        if (statusFilter === 'active') {
            matchesStatus =
                product.is_active &&
                product.seller?.is_active &&
                !product.is_locked;
        } else if (statusFilter === 'hidden') {
            matchesStatus =
                !product.is_active &&
                product.seller?.is_active &&
                !product.is_locked;
        } else if (statusFilter === 'product_locked') {
            matchesStatus =
                product.is_locked === true && product.seller?.is_active;
        } else if (statusFilter === 'seller_suspended') {
            matchesStatus = !product.seller?.is_active;
        }

        return matchesSearch && matchesStatus;
    });

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

        // Start the loading spinner
        setIsProcessing(true);

        if (action === 'delete') {
            router.delete(`/admin/products/${product.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setModalConfig({
                        isOpen: false,
                        action: null,
                        product: null,
                    });
                    toast(`"${product.title}" permanently deleted.`, 'delete');
                },
                onError: () => toast('Failed to delete product.', 'error'),
                onFinish: () => setIsProcessing(false), // <-- Stops the spinner
            });
        } else if (action === 'toggle') {
            // Determine if we are currently locking or unlocking it
            const isLocking = !product.is_locked;

            router.patch(
                `/admin/products/${product.id}/toggle`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setModalConfig({
                            isOpen: false,
                            action: null,
                            product: null,
                        });

                        // --- THE FIX: Dynamic message AND dynamic toast type! ---
                        const statusMessage = isLocking
                            ? 'locked and hidden'
                            : 'unlocked and published';

                        // If locking, use the 'info' or 'warning' toast styling.
                        // If unlocking, use the green 'success' styling.
                        const toastType = isLocking ? 'info' : 'success';

                        toast(
                            `"${product.title}" has been ${statusMessage}.`,
                            toastType,
                        );
                    },
                    onError: () =>
                        toast('Failed to update product status.', 'error'),
                    onFinish: () => setIsProcessing(false), // <-- Stops the spinner
                },
            );
        }
    };

    const getModalText = () => {
        if (modalConfig.action === 'delete') {
            return {
                title: 'Delete Product',
                message: `Are you sure you want to permanently delete "${modalConfig.product?.title}"? This action cannot be undone and will remove it from the platform entirely.`,
                confirmText: 'Yes, delete it',
                variant: 'danger' as const,
            };
        }

        if (modalConfig.action === 'toggle') {
            const isLocking = !modalConfig.product?.is_locked;

            return {
                title: isLocking
                    ? 'Lock & Hide Product'
                    : 'Unlock & Publish Product',
                message: isLocking
                    ? `Are you sure you want to lock "${modalConfig.product?.title}"? It will be hidden from the marketplace and the creator will not be able to republish it until you unlock it.`
                    : `Are you sure you want to unlock "${modalConfig.product?.title}"? This will instantly republish it to the marketplace.`,
                confirmText: isLocking ? 'Yes, lock it' : 'Yes, unlock it',
                variant: isLocking ? ('warning' as const) : ('info' as const),
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

    const getStatusBadge = (product: any) => {
        if (!product.seller?.is_active) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-500/20 ring-inset">
                    <UserX size={12} /> Seller Suspended
                </span>
            );
        }

        if (product.is_locked) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-500/20 ring-inset">
                    <Lock size={12} /> Product Locked
                </span>
            );
        }

        if (product.is_active) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-500/20 ring-inset">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>{' '}
                    Active
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-500/20 ring-inset">
                <EyeOff size={12} /> Hidden
            </span>
        );
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FAFAFC] font-sans text-slate-900">
            <Head title="Manage Products - Soko Admin" />
            <Navbar />

            <main className="relative z-10 flex-1 pt-32 pb-24">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            Manage Products
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Moderate all creator listings across the
                            marketplace.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5 ring-white">
                        {/* --- FILTER BAR --- */}
                        <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative w-full lg:max-w-md">
                                <Search
                                    size={18}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by title, seller or username..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter
                                        size={18}
                                        className="text-slate-400"
                                    />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                        className="rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-4 text-sm font-medium text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    >
                                        <option value="all">
                                            All Statuses
                                        </option>
                                        <option value="active">
                                            Available (Active)
                                        </option>
                                        <option value="hidden">
                                            Hidden by Creator
                                        </option>
                                        <option value="product_locked">
                                            Product Locked
                                        </option>
                                        <option value="seller_suspended">
                                            Seller Suspended
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            {filteredProducts.length === 0 ? (
                                <div className="py-10 text-center text-slate-500">
                                    No products found matching your filters.
                                </div>
                            ) : (
                                <>
                                    {/* === MOBILE CARD VIEW === */}
                                    <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                                        {filteredProducts.map(
                                            (product: any) => (
                                                <div
                                                    key={`mobile-${product.id}`}
                                                    className={`flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 ${!product.is_active || !product.seller?.is_active || product.is_locked ? 'opacity-60' : ''}`}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900">
                                                                {product.title}
                                                            </span>
                                                            <span className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-slate-400">
                                                                <span>
                                                                    Seller:{' '}
                                                                    {product
                                                                        .seller
                                                                        ?.name ||
                                                                        'Unknown'}
                                                                </span>
                                                                {product.seller
                                                                    ?.username && (
                                                                    <span className="font-medium text-slate-400">
                                                                        (@
                                                                        {
                                                                            product
                                                                                .seller
                                                                                .username
                                                                        }
                                                                        )
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        {getStatusBadge(
                                                            product,
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-slate-700">
                                                            Rp{' '}
                                                            {Number(
                                                                product.price,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-4">
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    product
                                                                        .seller
                                                                        ?.is_active
                                                                )
                                                                    promptToggle(
                                                                        product,
                                                                    );
                                                            }}
                                                            disabled={
                                                                !product.seller
                                                                    ?.is_active
                                                            }
                                                            className={`flex items-center justify-center rounded-xl py-3 transition-colors ${!product.seller?.is_active ? 'cursor-not-allowed bg-slate-50 text-slate-300' : product.is_locked ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}
                                                        >
                                                            {product.is_locked ? (
                                                                <Eye
                                                                    size={18}
                                                                />
                                                            ) : (
                                                                <EyeOff
                                                                    size={18}
                                                                />
                                                            )}
                                                        </button>
                                                        <a
                                                            href={`/products/${product.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center justify-center rounded-xl bg-slate-200/50 text-slate-700 transition-colors hover:bg-slate-200"
                                                        >
                                                            <ExternalLink
                                                                size={18}
                                                            />
                                                        </a>
                                                        <button
                                                            onClick={() =>
                                                                promptDelete(
                                                                    product,
                                                                )
                                                            }
                                                            className="flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    {/* === DESKTOP TABLE VIEW === */}
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-white text-slate-500">
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Product
                                                    </th>
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Seller
                                                    </th>
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-8 py-5 text-right font-bold tracking-wider uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredProducts.map(
                                                    (product: any) => (
                                                        <tr
                                                            key={`desktop-${product.id}`}
                                                            className={`transition-colors hover:bg-slate-50/50 ${!product.is_active || !product.seller?.is_active || product.is_locked ? 'opacity-60' : ''}`}
                                                        >
                                                            <td className="px-8 py-5">
                                                                <div className="font-bold text-slate-900">
                                                                    {
                                                                        product.title
                                                                    }
                                                                </div>
                                                                <div className="mt-0.5 text-xs text-slate-500">
                                                                    Rp{' '}
                                                                    {Number(
                                                                        product.price,
                                                                    ).toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-slate-700">
                                                                        {product
                                                                            .seller
                                                                            ?.name ||
                                                                            'Unknown'}
                                                                    </span>
                                                                    {product
                                                                        .seller
                                                                        ?.username && (
                                                                        <span className="mt-0.5 text-[11px] text-slate-400">
                                                                            @
                                                                            {
                                                                                product
                                                                                    .seller
                                                                                    .username
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                {getStatusBadge(
                                                                    product,
                                                                )}
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            if (
                                                                                product
                                                                                    .seller
                                                                                    ?.is_active
                                                                            )
                                                                                promptToggle(
                                                                                    product,
                                                                                );
                                                                        }}
                                                                        disabled={
                                                                            !product
                                                                                .seller
                                                                                ?.is_active
                                                                        }
                                                                        className={`flex items-center justify-center rounded-lg p-2 transition-colors ${!product.seller?.is_active ? 'cursor-not-allowed bg-slate-50 text-slate-300' : product.is_locked ? 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                                                                        title={
                                                                            !product
                                                                                .seller
                                                                                ?.is_active
                                                                                ? 'Locked: Seller is suspended'
                                                                                : product.is_locked
                                                                                  ? 'Unlock Product'
                                                                                  : 'Lock Product'
                                                                        }
                                                                    >
                                                                        {product.is_locked ? (
                                                                            <Eye
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <EyeOff
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        )}
                                                                    </button>
                                                                    <a
                                                                        href={`/products/${product.slug}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                                                                        title="View Listing"
                                                                    >
                                                                        <ExternalLink
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </a>
                                                                    <button
                                                                        onClick={() =>
                                                                            promptDelete(
                                                                                product,
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                                                        title="Delete Product"
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
                                </>
                            )}
                        </div>
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
        </div>
    );
}
