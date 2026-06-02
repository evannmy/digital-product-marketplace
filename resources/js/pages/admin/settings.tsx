import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Save,
    Percent,
    Settings as SettingsIcon,
    Building2,
    Plus,
    Trash2,
    Layers,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
import { useTranslation } from '@/hooks/useTranslation';

export default function AdminSettings({
    settings,
    withdrawalMethods = [],
    categories = [],
}: any) {
    const { t } = useTranslation();

    const { flash } = usePage().props as any;

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
        removeIndex: number | null;
        type: 'withdrawal' | 'category' | null;
    }>({
        isOpen: false,
        removeIndex: null,
        type: null,
    });

    const { data, setData, post, processing } = useForm({
        platform_cut_percentage: settings?.platform_cut_percentage || '5',
        withdrawal_free_threshold:
            settings?.withdrawal_free_threshold || '500000',
        withdrawal_methods: withdrawalMethods,
        categories: categories,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings', {
            preserveScroll: true,
            onError: () =>
                toast(
                    t('Failed to update settings. Please check your inputs.'),
                    'error',
                ),
        });
    };

    const formatCurrencyDisplay = (value: string | number) => {
        if (!value && value !== 0 && value !== '0') return '';

        const numericString = value.toString().replace(/\D/g, '');

        return numericString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\./g, '');
        setData('withdrawal_free_threshold', rawValue as never);
    };

    const handleFeeChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const rawValue = e.target.value.replace(/\./g, '');
        updateMethod(index, 'fee', rawValue);
    };

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const addMethod = () => {
        const newIndex = data.withdrawal_methods.length;
        setData('withdrawal_methods', [
            ...data.withdrawal_methods,
            { id: null, name: '', fee: '0', is_active: true },
        ] as never);
        setTimeout(() => {
            const newElement = document.getElementById(
                `method-name-${newIndex}`,
            );

            if (newElement) newElement.focus();
        }, 50);
    };

    const updateMethod = (index: number, field: string, value: any) => {
        const newMethods = [...data.withdrawal_methods];
        newMethods[index] = { ...newMethods[index], [field]: value };
        setData('withdrawal_methods', newMethods as never);
    };

    const addCategory = () => {
        const newIndex = data.categories.length;
        setData('categories', [
            ...data.categories,
            { id: null, name: '', slug: '' },
        ] as never);
        setTimeout(() => {
            const newElement = document.getElementById(
                `category-name-${newIndex}`,
            );

            if (newElement) newElement.focus();
        }, 50);
    };

    const updateCategory = (index: number, field: string, value: string) => {
        const newCats = [...data.categories];

        if (field === 'name') {
            newCats[index] = {
                ...newCats[index],
                name: value,
                slug: generateSlug(value),
            };
        } else {
            newCats[index] = { ...newCats[index], [field]: value };
        }

        setData('categories', newCats as never);
    };

    const promptRemove = (index: number, type: 'withdrawal' | 'category') => {
        setModalConfig({ isOpen: true, removeIndex: index, type });
    };

    const confirmRemove = () => {
        if (modalConfig.removeIndex !== null) {
            if (modalConfig.type === 'withdrawal') {
                const newMethods = [...data.withdrawal_methods];
                newMethods.splice(modalConfig.removeIndex, 1);
                setData('withdrawal_methods', newMethods as never);
            } else if (modalConfig.type === 'category') {
                const newCats = [...data.categories];
                newCats.splice(modalConfig.removeIndex, 1);
                setData('categories', newCats as never);
            }
        }

        setModalConfig({ isOpen: false, removeIndex: null, type: null });
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900">
            <Head title={t('Platform Settings - Soko Admin')} />
            <Navbar />

            <main className="relative z-10 mx-auto max-w-4xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        {t('Platform Settings')}
                    </h1>
                    <p className="mt-2 text-lg text-slate-500">
                        {t('Manage platform rules, categories, and fees.')}
                    </p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl ring-1 shadow-rose-900/5 ring-white backdrop-blur-xl sm:p-10">
                    <form onSubmit={submit} className="space-y-10">
                        {/* --- 1. GLOBAL FINANCIAL SETTINGS --- */}
                        <div className="border-b border-slate-100 pb-10">
                            <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-slate-900">
                                <SettingsIcon
                                    size={20}
                                    className="text-slate-400"
                                />
                                {t('Global Financial Rules')}
                            </h2>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="flex flex-col">
                                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                        {t('Platform Cut (Revenue Share)')}
                                    </label>
                                    <p className="mb-4 text-xs font-medium text-slate-500">
                                        {t(
                                            'The percentage taken by Soko from every successful sale.',
                                        )}
                                    </p>
                                    <div className="relative mt-auto">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="w-full [appearance:textfield] rounded-xl border border-slate-200 bg-white/50 px-4 py-3 pr-10 text-sm shadow-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            value={data.platform_cut_percentage}
                                            onChange={(e) =>
                                                setData(
                                                    'platform_cut_percentage',
                                                    e.target.value as never,
                                                )
                                            }
                                            required
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                                            <Percent size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                        {t('Free Withdrawal Minimum')}
                                    </label>
                                    <p className="mb-4 text-xs font-medium text-slate-500">
                                        {t(
                                            'Withdrawals over this amount bypass the transfer fee.',
                                        )}
                                    </p>
                                    <div className="relative mt-auto">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400">
                                            Rp
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 pl-12 text-sm shadow-sm transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                            value={formatCurrencyDisplay(
                                                data.withdrawal_free_threshold,
                                            )}
                                            onChange={handleThresholdChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- 2. MARKETPLACE CATEGORIES --- */}
                        <div className="border-b border-slate-100 pb-10">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
                                        <Layers
                                            size={20}
                                            className="text-slate-400"
                                        />
                                        {t('Marketplace Categories')}
                                    </h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        {t(
                                            'Manage the product categories available to sellers.',
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addCategory}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-600 transition-colors hover:bg-purple-100"
                                >
                                    <Plus size={18} /> {t('Add Category')}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {data.categories.map(
                                    (category: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all focus-within:ring-1 focus-within:ring-rose-500 sm:flex-row sm:items-start"
                                        >
                                            <div className="flex-1">
                                                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                                                    {t('Category Name')}
                                                </label>
                                                <input
                                                    id={`category-name-${index}`}
                                                    type="text"
                                                    required
                                                    maxLength={100}
                                                    placeholder={t(
                                                        'e.g. 3D Models',
                                                    )}
                                                    value={category.name}
                                                    onChange={(e) =>
                                                        updateCategory(
                                                            index,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                                                    {t('URL Slug')}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={100}
                                                    value={category.slug}
                                                    onChange={(e) =>
                                                        updateCategory(
                                                            index,
                                                            'slug',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                                />
                                            </div>

                                            <div className="flex items-center gap-6 sm:mt-8">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        promptRemove(
                                                            index,
                                                            'category',
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-600"
                                                    title={t('Remove Category')}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ),
                                )}

                                {data.categories.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-500">
                                        {t(
                                            'No categories exist. Click "Add Category" to create one.',
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- 3. WITHDRAWAL METHODS --- */}
                        <div className="pb-4">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
                                        <Building2
                                            size={20}
                                            className="text-slate-400"
                                        />
                                        {t('Withdrawal Methods & Fees')}
                                    </h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        {t(
                                            'Manage the bank options available to sellers and their specific transfer costs.',
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addMethod}
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-600 transition-colors hover:bg-emerald-100"
                                >
                                    <Plus size={18} /> {t('Add Method')}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {data.withdrawal_methods.map(
                                    (method: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all focus-within:ring-1 focus-within:ring-rose-500 sm:flex-row sm:items-start"
                                        >
                                            <div className="flex-1">
                                                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                                                    {t('Bank / E-Wallet Name')}
                                                </label>
                                                <input
                                                    id={`method-name-${index}`}
                                                    type="text"
                                                    required
                                                    placeholder={t(
                                                        'e.g. BCA, GoPay',
                                                    )}
                                                    value={method.name}
                                                    onChange={(e) =>
                                                        updateMethod(
                                                            index,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                                />
                                            </div>

                                            <div className="relative w-full sm:w-48">
                                                <label className="mb-1.5 block text-xs font-bold text-slate-500">
                                                    {t('Transfer Fee (Rp)')}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formatCurrencyDisplay(
                                                        method.fee,
                                                    )}
                                                    onChange={(e) =>
                                                        handleFeeChange(
                                                            index,
                                                            e,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <label className="mb-1.5 hidden text-xs font-bold text-transparent sm:block">
                                                    {t('Status')}
                                                </label>
                                                <div className="flex h-10 items-center gap-4">
                                                    <label className="flex cursor-pointer items-center gap-3">
                                                        <div className="relative inline-flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    method.is_active
                                                                }
                                                                onChange={(e) =>
                                                                    updateMethod(
                                                                        index,
                                                                        'is_active',
                                                                        e.target
                                                                            .checked,
                                                                    )
                                                                }
                                                                className="peer sr-only"
                                                            />
                                                            <div className="h-6 w-11 rounded-full bg-slate-200/80 transition-colors peer-checked:bg-emerald-400 peer-focus:ring-2 peer-focus:ring-emerald-400/30 peer-focus:outline-none after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-5"></div>
                                                        </div>
                                                        <span
                                                            className={`w-20 text-sm font-bold transition-colors ${method.is_active ? 'text-emerald-500' : 'text-slate-400'}`}
                                                        >
                                                            {method.is_active
                                                                ? t('Active')
                                                                : t(
                                                                      'Not Active',
                                                                  )}
                                                        </span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            promptRemove(
                                                                index,
                                                                'withdrawal',
                                                            )
                                                        }
                                                        className="flex items-center justify-center rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-100 hover:text-rose-600"
                                                        title={t(
                                                            'Remove Method',
                                                        )}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}

                                {data.withdrawal_methods.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-500">
                                        {t(
                                            'No withdrawal methods configured. Click "Add Method" to create one.',
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- SUBMIT --- */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {processing ? (
                                    t('Saving...')
                                ) : (
                                    <>
                                        <Save size={20} /> {t('Save')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* --- REUSABLE CONFIRMATION MODAL --- */}
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() =>
                    setModalConfig({
                        isOpen: false,
                        removeIndex: null,
                        type: null,
                    })
                }
                onConfirm={confirmRemove}
                title={
                    modalConfig.type === 'withdrawal'
                        ? t('Remove Withdrawal Method')
                        : t('Remove Category')
                }
                message={
                    modalConfig.type === 'withdrawal'
                        ? t(
                              'Are you sure you want to remove this withdrawal method? This will prevent sellers from selecting it in the future.',
                          )
                        : t(
                              'Are you sure you want to delete this category? Make sure no active products are currently using it.',
                          )
                }
                confirmText={t('Yes, remove it')}
                cancelText={t('Cancel')}
                variant="danger"
            />
        </div>
    );
}
