import { Head, Link, useForm } from '@inertiajs/react';
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
    Save,
    AlertTriangle,
    X,
    Video,
} from 'lucide-react';
import React, { useState } from 'react';
import SimpleNavbar from '@/components/simple-navbar';
import { toast } from '@/components/toaster';
import { Spinner } from '@/components/ui/spinner';

// --- UPDATED: Isolated Thumbnail Component for Existing Media ---
function ExistingMediaThumbnail({
    media,
    index,
    onRemove,
}: {
    media: any;
    index: number;
    onRemove: (id: number) => void;
}) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        'loading',
    );

    return (
        <div className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-2 ring-transparent transition-all">
            {/* 1. Loading State */}
            {status === 'loading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50">
                    <Spinner className="h-4 w-4 animate-spin text-slate-400" />
                </div>
            )}

            {/* 2. Error State */}
            {status === 'error' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                    {media.file_type === 'video' ? (
                        <Video size={20} className="mb-1 opacity-50" />
                    ) : (
                        <ImageIcon size={20} className="mb-1 opacity-50" />
                    )}
                    <span className="text-[8px] font-bold tracking-widest uppercase opacity-70">
                        Error
                    </span>
                </div>
            )}

            {/* 3. Actual Media */}
            {media.file_type === 'video' ? (
                <video
                    src={`/storage/${media.file_path}`}
                    className={`h-full w-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedData={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            ) : (
                <img
                    src={`/storage/${media.file_path}`}
                    alt="Preview"
                    className={`h-full w-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                />
            )}

            <button
                type="button"
                onClick={() => onRemove(media.id)}
                className="absolute top-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/90 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-rose-600"
                title="Delete this file permanently"
            >
                <X size={14} strokeWidth={3} />
            </button>

            {index === 0 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 rounded-b-lg bg-slate-900/60 py-1 text-center text-[10px] font-bold text-white backdrop-blur-sm">
                    COVER
                </div>
            )}
        </div>
    );
}

export default function Edit({ product, categories }: any) {
    // --- FORM STATE ---
    const { data, setData, post, processing, errors } = useForm({
        title: product.title || '',
        description: product.description || '',
        price:
            product.price !== null && product.price !== undefined
                ? product.price.toString()
                : '0',
        category_id: product.category_id || '',
        product_file: null as File | null,

        // Gallery States
        media: [] as File[], // New files to upload
        remove_media: [] as number[], // IDs of existing media to delete
    });

    // --- GALLERY DISPLAY STATES ---
    // 1. Keep track of what's already in the database
    const [existingMedia, setExistingMedia] = useState<any[]>(
        product.media || [],
    );
    // 2. Keep track of new files being previewed
    const [previews, setPreviews] = useState<{ url: string; type: string }[]>(
        [],
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Uses POST because Laravel requires method spoofing (_method: PUT) for file uploads,
        // which Inertia handles automatically if we just use a post route.
        post(`/seller/products/${product.id}/update`);
    };

    // --- PRICE FORMATTING HELPERS ---
    const handlePriceStep = (amount: number) => {
        const cleanString = (data.price as string)
            .toString()
            .replace(/\./g, '');
        const currentPrice = parseInt(cleanString) || 0;
        const newPrice = Math.max(0, currentPrice + amount);
        setData('price', newPrice.toString());
    };

    const formatPriceDisplay = (value: string | number) => {
        if (!value && value !== 0 && value !== '0') return '';

        const numericString = value.toString().replace(/\D/g, '');

        return numericString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleManualTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\./g, '');
        setData('price', rawValue);
    };

    // --- FILE HANDLERS ---
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
        const currentLength =
            typeof existingMedia !== 'undefined'
                ? existingMedia.length + data.media.length
                : data.media.length;

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

    // --- REMOVAL HANDLERS ---
    const removeNewMedia = (indexToRemove: number) => {
        URL.revokeObjectURL(previews[indexToRemove].url);
        setData(
            'media',
            data.media.filter((_, index) => index !== indexToRemove),
        );
        setPreviews(previews.filter((_, index) => index !== indexToRemove));
    };

    const removeExistingMedia = (idToRemove: number) => {
        // Hide it from the UI immediately
        setExistingMedia(existingMedia.filter((m) => m.id !== idToRemove));
        // Tell the backend to delete it on submit
        setData('remove_media', [...data.remove_media, idToRemove]);
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
            <Head title={`Edit ${product.title} - Soko`} />
            <SimpleNavbar />

            <main className="relative z-10 flex-1 pt-32 pb-24">
                <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                Edit Product
                            </h1>
                            <p className="mt-2 text-lg text-slate-500">
                                Update your product details or replace source
                                files.
                            </p>
                        </div>
                        <Link
                            href="/seller/products/mine"
                            className="text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
                        >
                            Cancel Editing
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-xl sm:p-10">
                        <form onSubmit={submit} className="space-y-8">
                            {/* --- BASIC INFO (Title, Category, Price, Desc) --- */}
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
                                            {categories?.map(
                                                (category: any) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                ),
                                            )}
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
                                            onClick={() =>
                                                handlePriceStep(-10000)
                                            }
                                            className="flex w-12 items-center justify-center border-r border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
                                        >
                                            <Minus
                                                size={16}
                                                strokeWidth={2.5}
                                            />
                                        </button>
                                        <div className="relative flex-1">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="text-sm font-bold text-slate-400">
                                                    Rp
                                                </span>
                                            </div>
                                            <input
                                                type="text"
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
                                            onClick={() =>
                                                handlePriceStep(10000)
                                            }
                                            className="flex w-12 items-center justify-center border-l border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
                                        >
                                            <Plus size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    {errors.price && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                            <AlertCircle size={12} />{' '}
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Tag size={16} className="text-slate-400" />
                                    Description
                                </label>
                                <textarea
                                    rows={5}
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

                            {/* --- FILE & MEDIA OVERRIDES --- */}
                            <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-8 sm:grid-cols-2">
                                {/* The Digital File Override */}
                                <div>
                                    <div className="mb-2 flex items-start gap-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            Update Source File
                                        </label>
                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700 uppercase">
                                            Optional
                                        </span>
                                    </div>
                                    <div
                                        className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${data.product_file ? 'border-emerald-400 bg-emerald-50' : 'border-amber-200 bg-amber-50/50 hover:border-amber-400 hover:bg-amber-50'}`}
                                    >
                                        {data.product_file ? (
                                            <>
                                                <UploadCloud className="mb-2 h-8 w-8 text-emerald-500" />
                                                <span className="line-clamp-1 text-sm font-semibold text-emerald-700">
                                                    Ready to upload:
                                                    <br />
                                                    {data.product_file.name}
                                                </span>
                                                <span className="mt-1 text-xs text-emerald-600">
                                                    This will overwrite the old
                                                    file
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="mb-2 h-8 w-8 text-amber-400" />
                                                <span className="text-sm font-semibold text-amber-700">
                                                    Current file is active
                                                </span>
                                                <span className="mt-1 text-xs text-amber-600/80">
                                                    Upload a new .zip/.pdf to
                                                    replace it
                                                </span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                                            onChange={handleSourceFileChange}
                                        />
                                    </div>
                                    {errors.product_file && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                            <AlertCircle size={12} />{' '}
                                            {errors.product_file}
                                        </p>
                                    )}
                                </div>

                                {/* Media Gallery Addition */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-bold text-slate-700">
                                                Add to Gallery
                                            </label>
                                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700 uppercase">
                                                Optional
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                            {existingMedia.length +
                                                data.media.length}{' '}
                                            / 10
                                        </span>
                                    </div>

                                    <div className="relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-purple-400 hover:bg-purple-50">
                                        <ImageIcon className="mb-2 h-8 w-8 text-purple-500" />
                                        <span className="text-sm font-semibold text-slate-700">
                                            Upload More Images & Videos
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
                                            <AlertCircle size={12} />{' '}
                                            {errors.media}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* --- GALLERY PREVIEW ROW (Existing + New) --- */}
                            {(existingMedia.length > 0 ||
                                previews.length > 0) && (
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <p className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Current Gallery
                                    </p>
                                    <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                        {/* 1. Show Existing Media (Using our new component) */}
                                        {existingMedia.map((media, index) => (
                                            <ExistingMediaThumbnail
                                                key={media.id}
                                                media={media}
                                                index={index}
                                                onRemove={removeExistingMedia}
                                            />
                                        ))}

                                        {/* 2. Show New Pending Media */}
                                        {previews.map((preview, index) => (
                                            <div
                                                key={`new-${index}`}
                                                className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-emerald-400 bg-white shadow-sm ring-2 ring-emerald-100 transition-all"
                                            >
                                                {preview.type === 'image' ? (
                                                    <img
                                                        src={preview.url}
                                                        alt="New Preview"
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

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeNewMedia(index)
                                                    }
                                                    className="absolute top-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/90 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-rose-600"
                                                >
                                                    <X
                                                        size={14}
                                                        strokeWidth={3}
                                                    />
                                                </button>

                                                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 rounded-b-lg bg-emerald-500/90 py-1 text-center text-[10px] font-bold text-white backdrop-blur-sm">
                                                    NEW
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="border-t border-slate-100 pt-8">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
                                >
                                    {processing ? (
                                        'Saving Changes...'
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Update Product
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
