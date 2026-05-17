import { Head, useForm } from '@inertiajs/react';
import {
    UploadCloud,
    Image as ImageIcon,
    FileText,
    Tag,
    DollarSign,
    Layers,
    AlertCircle,
    Minus,
    Plus,
    ChevronDown,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import SimpleNavbar from '@/components/simple-navbar';
import { toast } from '@/components/toaster';

export default function Create({ categories }: any) {
    // --- 1. UPDATED FORM STATE ---
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        price: '',
        category_id: '',
        product_file: null as File | null,
        media: [] as File[], // Now an array for the gallery
    });

    // Helper for previewing images in the browser
    const [previews, setPreviews] = useState<{ url: string; type: string }[]>(
        [],
    );

    const handlePriceStep = (amount: number) => {
        const cleanString = (data.price as string)
            .toString()
            .replace(/\./g, '');
        const currentPrice = parseInt(cleanString) || 0;
        const newPrice = Math.max(0, currentPrice + amount);
        setData('price', newPrice.toString());
    };

    const formatPriceDisplay = (value: string | number) => {
        if (!value) return '';

        const numericString = value.toString().replace(/\D/g, '');

        return numericString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleManualTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\./g, '');
        setData('price', rawValue);
    };

    // --- 2. UPDATED FILE HANDLER ---
    const handleSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;

        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                toast('Source file must be under 50MB.', 'error');
                e.target.value = '';

                return;
            }

            setData('product_file', file);
        }
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles = Array.from(e.target.files);
        const validFiles: File[] = [];
        const newPreviews: { url: string; type: string }[] = [];

        // Note: If you are in Create.tsx, just use `data.media.length`.
        // If in Edit.tsx, use `existingMedia.length + data.media.length`.
        const currentLength = data.media.length;

        if (currentLength + newFiles.length > 10) {
            toast('You can only have up to 10 media files.', 'error');

            return;
        }

        newFiles.forEach((file) => {
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');

            // --- VIDEO LIMIT: 20MB ---
            if (isVideo && file.size > 20 * 1024 * 1024) {
                toast(`${file.name} is too large. Videos max 20MB.`, 'error');

                return;
            }

            // --- IMAGE LIMIT: 5MB ---
            if (isImage && file.size > 5 * 1024 * 1024) {
                toast(`${file.name} is too large. Images max 5MB.`, 'error');

                return;
            }

            validFiles.push(file);
            const url = URL.createObjectURL(file);
            newPreviews.push({
                url,
                type: isVideo ? 'video' : 'image',
            });
        });

        setData('media', [...data.media, ...validFiles]);
        setPreviews([...previews, ...newPreviews]);
        e.target.value = '';
    };

    const removeMedia = (indexToRemove: number) => {
        // Clean up the object URL to avoid memory leaks
        URL.revokeObjectURL(previews[indexToRemove].url);

        setData(
            'media',
            data.media.filter((_, index) => index !== indexToRemove),
        );
        setPreviews(previews.filter((_, index) => index !== indexToRemove));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('products.store'), {
            forceFormData: true,
            onError: () =>
                toast('Failed to upload product. Check for errors.', 'error'),
        });
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
            <Head title="Create Product - Soko" />

            <SimpleNavbar />

            <main className="relative z-10 mx-auto max-w-3xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        Upload Digital Product
                    </h1>
                    <p className="mt-2 text-lg text-slate-500">
                        Package your expertise and share it with the world.
                    </p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-xl sm:p-10">
                    <form onSubmit={submit} className="space-y-8">
                        {/* Title Field */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                <FileText
                                    size={16}
                                    className="text-slate-400"
                                />
                                Product Title
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., My E-Book"
                                className={`w-full rounded-xl border bg-white/50 px-4 py-3 text-sm shadow-sm transition-colors focus:bg-white focus:ring-1 focus:outline-none ${errors.title ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500'}`}
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                required
                            />
                            {errors.title && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle size={12} /> {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                            {/* Category Drodown */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Layers
                                        size={16}
                                        className="text-slate-400"
                                    />
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        className={`w-full appearance-none rounded-xl border bg-white/50 px-4 py-3 pr-12 text-sm shadow-sm transition-colors focus:bg-white focus:ring-1 focus:outline-none ${errors.category_id ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500'}`}
                                        value={data.category_id}
                                        onChange={(e) =>
                                            setData(
                                                'category_id',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="" disabled>
                                            Select a category
                                        </option>
                                        {categories?.map((category: any) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                                        <ChevronDown
                                            size={18}
                                            strokeWidth={2}
                                        />
                                    </div>
                                </div>
                                {errors.category_id && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                        <AlertCircle size={12} />{' '}
                                        {errors.category_id}
                                    </p>
                                )}
                            </div>

                            {/* Price Stepper */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <DollarSign
                                        size={16}
                                        className="text-slate-400"
                                    />
                                    Price (IDR)
                                </label>
                                <div
                                    className={`flex w-full items-stretch overflow-hidden rounded-xl border bg-white/50 shadow-sm transition-colors focus-within:bg-white ${errors.price ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500' : 'border-slate-200 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500'}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handlePriceStep(-10000)}
                                        className="flex w-12 items-center justify-center border-r border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
                                    >
                                        <Minus size={16} strokeWidth={2.5} />
                                    </button>
                                    <div className="relative flex-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-sm font-bold text-slate-400">
                                                Rp
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="150.000"
                                            className="block w-full border-none bg-transparent py-3 pr-4 pl-9 text-center text-sm focus:ring-0 focus:outline-none"
                                            value={formatPriceDisplay(
                                                data.price,
                                            )}
                                            onChange={handleManualTyping}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handlePriceStep(10000)}
                                        className="flex w-12 items-center justify-center border-l border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
                                    >
                                        <Plus size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                                {errors.price && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                        <AlertCircle size={12} /> {errors.price}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Tag size={16} className="text-slate-400" />
                                Description
                            </label>
                            <textarea
                                rows={5}
                                placeholder="Describe what makes your product valuable..."
                                className={`w-full resize-y rounded-xl border bg-white/50 px-4 py-3 text-sm shadow-sm transition-colors focus:bg-white focus:ring-1 focus:outline-none ${errors.description ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500'}`}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                required
                            />
                            {errors.description && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                    <AlertCircle size={12} />{' '}
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* --- 3. UPDATED FILE UPLOADS --- */}
                        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-8 sm:grid-cols-2">
                            {/* The Digital File (Unchanged) */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Source File (Required)
                                </label>
                                <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50">
                                    <UploadCloud className="mb-2 h-8 w-8 text-emerald-500" />
                                    <span className="line-clamp-1 text-sm font-semibold text-slate-700">
                                        {data.product_file
                                            ? data.product_file.name
                                            : 'Upload .zip or .pdf'}
                                    </span>
                                    <span className="mt-1 text-xs text-slate-400">
                                        Max size 50MB
                                    </span>
                                    <input
                                        type="file"
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        onChange={handleSourceFileChange}
                                        required
                                    />
                                </div>
                                {errors.product_file && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                        <AlertCircle size={12} />{' '}
                                        {errors.product_file}
                                    </p>
                                )}
                            </div>

                            {/* The New Media Gallery Upload */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="block text-sm font-bold text-slate-700">
                                        Media Gallery (Optional)
                                    </label>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                        {data.media.length} / 10
                                    </span>
                                </div>

                                <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-purple-400 hover:bg-purple-50">
                                    <ImageIcon className="mb-2 h-8 w-8 text-purple-500" />
                                    <span className="text-sm font-semibold text-slate-700">
                                        Add Images & Videos
                                    </span>
                                    <span className="mt-1 text-xs text-slate-400">
                                        Images max 5MB • Videos max 20MB
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        onChange={handleMediaChange}
                                    />
                                </div>
                                {errors.media && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                        <AlertCircle size={12} /> {errors.media}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* --- NEW: MEDIA GALLERY PREVIEW ROW --- */}
                        {previews.length > 0 && (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Gallery Preview
                                </p>
                                <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {previews.map((preview, index) => (
                                        <div
                                            key={index}
                                            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                        >
                                            {preview.type === 'image' ? (
                                                <img
                                                    src={preview.url}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                /* --- FIXED: Show actual video frame for new uploads! --- */
                                                <video
                                                    src={preview.url}
                                                    className="h-full w-full object-cover"
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            )}

                                            {/* Remove Button Overlay */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMedia(index)
                                                }
                                                className="absolute top-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/90 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-rose-600"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>

                                            {/* Primary Label for the first image */}
                                            {index === 0 && (
                                                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 rounded-b-lg bg-slate-900/60 py-1 text-center text-[10px] font-bold text-white backdrop-blur-sm">
                                                    COVER
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-8">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
                            >
                                {processing ? (
                                    'Uploading files...'
                                ) : (
                                    <>
                                        <UploadCloud size={20} />
                                        Publish Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
