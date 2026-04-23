import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

export default function PromotionsIndex({ products }: any) {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Setup the form data
    const { data, setData, post, processing, errors, reset } = useForm({
        product_ids: [] as number[],
        discount_percentage: '',
        starts_at: '',
        ends_at: '',
        timezone: userTimeZone,
    });

    // 1. Temporary state for the custom duration inputs
    const [customHours, setCustomHours] = useState<number | ''>('');
    const [customMinutes, setCustomMinutes] = useState<number | ''>('');

    // 2. The Math Logic
    const applyCustomDuration = () => {
        // If the seller hasn't picked a start time yet, assume they mean "Right Now"
        const baseTime = data.starts_at ? new Date(data.starts_at) : new Date();

        const h = Number(customHours) || 0;
        const m = Number(customMinutes) || 0;

        // Calculate the exact milliseconds to add
        const durationInMs = h * 60 * 60 * 1000 + m * 60 * 1000;
        const endTime = new Date(baseTime.getTime() + durationInMs);

        // Helper to format dates for the HTML <input>
        const formatForInput = (dateObj: Date) => {
            return new Date(
                dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
            )
                .toISOString()
                .slice(0, 16);
        };

        // Update the main Inertia form data!
        setData({
            ...data,
            starts_at: data.starts_at || formatForInput(baseTime),
            ends_at: formatForInput(endTime),
        });

        // Optional: Clear the mini-inputs after applying
        setCustomHours('');
        setCustomMinutes('');
    };

    // Handle Checkbox clicks
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

    const submitPromotion = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('promotions.apply'), {
            onSuccess: () =>
                reset(
                    'discount_percentage',
                    'starts_at',
                    'ends_at',
                    'product_ids',
                ),
        });
    };

    const clearPromotion = () => {
        if (
            window.confirm(
                'Are you sure you want to remove the discount from these products?',
            )
        ) {
            router.post(
                route('promotions.clear'),
                {
                    product_ids: data.product_ids,
                },
                {
                    onSuccess: () => reset('product_ids'),
                },
            );
        }
    };

    // --- UPDATED: Live Preview Math ---
    const discountValue = Number(data.discount_percentage) || 0;

    // Grab every single product that is currently checked
    const selectedProducts = products.filter((p: any) =>
        data.product_ids.includes(p.id),
    );

    return (
        <AppLayout>
            <Head title="Manage Promotions" />

            <div className="mx-auto max-w-7xl py-12 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Campaign & Promotions
                    </h2>
                    <p className="text-gray-600">
                        Select products below to apply a mass discount campaign.
                    </p>
                </div>

                <div className="flex flex-col gap-8 md:flex-row">
                    {/* LEFT SIDE: The Campaign Form */}
                    <div className="md:w-1/3">
                        <form
                            onSubmit={submitPromotion}
                            className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm"
                        >
                            <h3 className="mb-4 text-lg font-bold">
                                Create Flash Sale
                            </h3>

                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium">
                                    Discount Percentage (%)
                                </label>
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
                                    className="w-full rounded-md border-gray-300"
                                    placeholder="e.g. 20"
                                />
                                {errors.discount_percentage && (
                                    <span className="text-xs text-red-500">
                                        {errors.discount_percentage}
                                    </span>
                                )}

                                {/* --- UPGRADED: Bulk Live Calculation Preview --- */}
                                {discountValue > 0 &&
                                    discountValue < 100 &&
                                    selectedProducts.length > 0 && (
                                        <div className="mt-3 flex flex-col overflow-hidden rounded-md border border-blue-200 bg-blue-50">
                                            <div className="border-b border-blue-200 bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900">
                                                Price Preview (
                                                {selectedProducts.length} items)
                                            </div>

                                            {/* Adding max-h-48 and overflow-y-auto makes it scrollable! */}
                                            <div className="max-h-48 overflow-y-auto p-3">
                                                <ul className="space-y-3">
                                                    {selectedProducts.map(
                                                        (product: any) => (
                                                            <li
                                                                key={product.id}
                                                                className="flex items-center justify-between border-b border-blue-100 pb-2 last:border-0 last:pb-0"
                                                            >
                                                                <span className="truncate pr-4 text-sm font-medium text-blue-800">
                                                                    {
                                                                        product.title
                                                                    }
                                                                </span>
                                                                <div className="flex shrink-0 flex-col items-end">
                                                                    <span className="text-xs text-gray-500 line-through">
                                                                        Rp{' '}
                                                                        {product.price.toLocaleString(
                                                                            'id-ID',
                                                                        )}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-green-600">
                                                                        Rp{' '}
                                                                        {(
                                                                            product.price *
                                                                            (1 -
                                                                                discountValue /
                                                                                    100)
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
                                {/* --- END Bulk Live Calculation Preview --- */}
                            </div>

                            {/* --- UPGRADED: Custom Duration Calculator --- */}
                            <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Calculate Exact Duration
                                </label>
                                <div className="flex items-end gap-2">
                                    <div className="w-1/3">
                                        <label className="mb-1 block text-xs text-gray-500">
                                            Hours
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={customHours}
                                            onChange={(e) =>
                                                setCustomHours(
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            className="w-full rounded-md border-gray-300 py-1.5 text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="mb-1 block text-xs text-gray-500">
                                            Minutes
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={customMinutes}
                                            onChange={(e) =>
                                                setCustomMinutes(
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            className="w-full rounded-md border-gray-300 py-1.5 text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <button
                                            type="button"
                                            onClick={applyCustomDuration}
                                            disabled={
                                                !customHours && !customMinutes
                                            }
                                            className="w-full rounded-md bg-gray-800 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:bg-gray-300"
                                        >
                                            Set End Time
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium">
                                    Starts At
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.starts_at}
                                    onChange={(e) =>
                                        setData('starts_at', e.target.value)
                                    }
                                    className="w-full rounded-md border-gray-300"
                                />
                                {errors.starts_at && (
                                    <span className="text-xs text-red-500">
                                        {errors.starts_at}
                                    </span>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="mb-1 block text-sm font-medium">
                                    Ends At
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.ends_at}
                                    onChange={(e) =>
                                        setData('ends_at', e.target.value)
                                    }
                                    className="w-full rounded-md border-gray-300"
                                />
                                {errors.ends_at && (
                                    <span className="text-xs text-red-500">
                                        {errors.ends_at}
                                    </span>
                                )}
                            </div>

                            {/* --- UPDATED: Action Buttons Container --- */}
                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.product_ids.length === 0
                                    }
                                    className="w-full rounded-md bg-blue-600 py-2.5 font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    Apply to {data.product_ids.length} Products
                                </button>

                                <button
                                    type="button"
                                    onClick={clearPromotion}
                                    disabled={data.product_ids.length === 0}
                                    className="w-full rounded-md border border-red-200 bg-white py-2.5 font-bold text-red-600 transition hover:bg-red-50 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    Clear Discount
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT SIDE: The Product List with Checkboxes */}
                    <div className="md:w-2/3">
                        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Select</th>
                                        <th className="px-6 py-3">
                                            Product Name
                                        </th>
                                        <th className="px-6 py-3">
                                            Original Price
                                        </th>
                                        <th className="px-6 py-3">
                                            Active Promo?
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product: any) => (
                                        <tr
                                            key={product.id}
                                            className="border-b"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={data.product_ids.includes(
                                                        product.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleProduct(
                                                            product.id,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {product.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                Rp{' '}
                                                {product.price.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {/* Reusing the magic attribute we made earlier! */}
                                                {product.is_discount_active ? (
                                                    <span className="font-bold text-red-600">
                                                        Yes (Rp{' '}
                                                        {Number(
                                                            product.discount_price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                        )
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        None
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
