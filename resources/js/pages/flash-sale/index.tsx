import { Head, Link, router, usePage, useRemember } from '@inertiajs/react';
import axios from 'axios';
import { Search, ChevronDown, Sparkles, PlayCircle, Flame } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import BackToTop from '@/components/back-to-top';
import SimpleNavbar from '@/components/simple-navbar';
import { toast } from '@/components/toaster';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/useTranslation';

// --- Komponen Kartu Produk ---
function ProductCard({ product, auth }: { product: any; auth: any }) {
    const { t } = useTranslation();
    const hasMedia = product.media && product.media.length > 0;
    const [mediaStatus, setMediaStatus] = useState<
        'loading' | 'loaded' | 'error'
    >(hasMedia ? 'loading' : 'loaded');
    const [avatarStatus, setAvatarStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-left ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 hover:ring-rose-200"
        >
            <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-slate-100 p-6">
                {mediaStatus === 'loading' && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                        <Spinner className="h-8 w-8 animate-spin text-rose-400" />
                    </div>
                )}
                {mediaStatus === 'error' && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-rose-300">
                        <Sparkles className="mb-2 h-8 w-8 opacity-50" />
                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase opacity-70">
                            {t('media failed to load')}
                        </span>
                    </div>
                )}
                {hasMedia ? (
                    product.media[0].file_type === 'video' ? (
                        <div
                            className="group/video relative h-full w-full"
                            onMouseEnter={() =>
                                videoRef.current?.play().catch(() => {})
                            }
                            onMouseLeave={() => {
                                if (videoRef.current) {
                                    videoRef.current.pause();
                                    videoRef.current.currentTime = 0;
                                }
                            }}
                        >
                            <video
                                ref={videoRef}
                                src={`/storage/${product.media[0].file_path}#t=0.1`}
                                className={`h-full w-full rounded-lg object-cover shadow-sm transition-all duration-500 group-hover:scale-105 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                muted
                                playsInline
                                loop
                                preload="metadata"
                                onLoadedData={() => setMediaStatus('loaded')}
                                onError={() => setMediaStatus('error')}
                            />
                            {mediaStatus === 'loaded' && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover/video:opacity-0">
                                    <PlayCircle className="h-12 w-12 text-white/80 drop-shadow-lg" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <img
                            src={`/storage/${product.media[0].file_path}`}
                            alt={product.title}
                            className={`h-full w-full rounded-lg object-cover shadow-sm transition-all duration-500 group-hover:scale-105 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setMediaStatus('loaded')}
                            onError={() => setMediaStatus('error')}
                        />
                    )
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-rose-200">
                        <Sparkles size={32} />
                    </div>
                )}

                {product.is_discount_active && (
                    <div className="absolute top-4 left-4 z-20 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-black tracking-wider text-white shadow-sm ring-1 ring-black/10 backdrop-blur-md">
                        {t('SALE')}
                    </div>
                )}
            </div>

            <div className="flex grow flex-col bg-white p-6 sm:p-7">
                <h3 className="mb-3 line-clamp-1 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-rose-600">
                    {product.title}
                </h3>
                <p className="mb-8 line-clamp-2 grow text-sm leading-relaxed text-slate-500">
                    {product.description}
                </p>

                {/* --- BAGIAN YANG DIPERBAIKI: Layout Footer Vertikal Modern (Dengan Username) --- */}
                <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-5">
                    {/* 1. Baris Harga (Fokus Utama, Lebar Penuh) */}
                    <div className="flex flex-col">
                        {product.is_discount_active ? (
                            <>
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-rose-600 uppercase">
                                        {t('Sale')}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400 line-through">
                                        Rp{' '}
                                        {Number(product.price).toLocaleString(
                                            'id-ID',
                                        )}
                                    </span>
                                </div>
                                <span className="text-2xl font-black tracking-tight text-rose-600">
                                    Rp{' '}
                                    {Math.round(
                                        Number(product.discount_price),
                                    ).toLocaleString('id-ID')}
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-black tracking-tight text-slate-900">
                                Rp{' '}
                                {product.price
                                    ? Number(product.price).toLocaleString(
                                          'id-ID',
                                      )
                                    : '0'}
                            </span>
                        )}
                    </div>

                    {/* 2. Baris Kreator (Nama & Username Tersusun Rapi) */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                            {product.seller?.avatar_path &&
                            avatarStatus !== 'error' ? (
                                <img
                                    src={
                                        product.seller.avatar_path.startsWith(
                                            'http',
                                        )
                                            ? product.seller.avatar_path
                                            : `/storage/${product.seller.avatar_path}`
                                    }
                                    alt={product.seller.name}
                                    className={`h-full w-full object-cover transition-opacity duration-300 ${avatarStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setAvatarStatus('loaded')}
                                    onError={() => setAvatarStatus('error')}
                                />
                            ) : product.seller?.name ? (
                                product.seller.name.charAt(0).toUpperCase()
                            ) : (
                                'S'
                            )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <div className="flex w-full items-center gap-1.5">
                                <span className="truncate text-sm font-semibold text-slate-900">
                                    {product.seller?.name ||
                                        t('Verified Seller')}
                                </span>

                                {auth?.user?.id === product.seller?.id && (
                                    <span className="shrink-0 rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-rose-700 uppercase ring-1 ring-rose-500/20 ring-inset">
                                        {t('You')}
                                    </span>
                                )}
                            </div>

                            {product.seller?.username && (
                                <span className="w-full truncate text-xs font-medium text-slate-400">
                                    @{product.seller.username}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function FlashSaleIndex({ products, categories, filters }: any) {
    const { t } = useTranslation();
    const { version } = usePage() as any;
    const { auth, flash } = usePage().props as any;

    const searchInputRef = useRef<HTMLInputElement>(null);

    const getProductsArray = (source: any) => {
        if (!source) return [];

        if (Array.isArray(source)) return source;

        if (Array.isArray(source.data)) return source.data;

        return [];
    };

    const getNextUrl = (source: any) => {
        if (!source) return null;

        if (source.next_page_url) return source.next_page_url;

        if (source.links?.next) return source.links.next;

        return null;
    };

    const safeFilters = useMemo(
        () => (Array.isArray(filters) ? {} : filters || {}),
        [filters],
    );

    const [search, setSearch] = useRemember(
        safeFilters.search || '',
        'flash-search',
    );
    const [categorySlug, setCategorySlug] = useRemember(
        safeFilters.category || '',
        'flash-category',
    );
    const [sort, setSort] = useRemember(
        safeFilters.sort || 'newest',
        'flash-sort',
    );

    const [allProducts, setAllProducts] = useRemember(
        getProductsArray(products),
        'flash-products',
    );
    const [nextPageUrl, setNextPageUrl] = useRemember(
        getNextUrl(products),
        'flash-next-url',
    );
    const [prevFilters, setPrevFilters] = useRemember(
        safeFilters,
        'flash-prev-filters',
    );

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast(flash.success, 'success');
            flash.success = null;
        }

        if (flash?.error) {
            toast(flash.error, 'error');
            flash.error = null;
        }
    }, [flash]);

    useEffect(() => {
        if (JSON.stringify(safeFilters) !== JSON.stringify(prevFilters)) {
            setAllProducts(getProductsArray(products));
            setNextPageUrl(getNextUrl(products));
            setPrevFilters(safeFilters);
        }
    }, [
        products,
        safeFilters,
        prevFilters,
        setAllProducts,
        setNextPageUrl,
        setPrevFilters,
    ]);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        router.get(
            '/flash-sale',
            { search, category: categorySlug, sort },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleCategoryClick = (slug: string) => {
        setCategorySlug(slug);
        router.get(
            '/flash-sale',
            { search, category: slug, sort },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleLoadMore = async () => {
        if (!nextPageUrl) return;

        setIsLoadingMore(true);

        try {
            const response = await axios.get(nextPageUrl, {
                headers: {
                    'X-Inertia': 'true',
                    'X-Inertia-Version': version,
                    Accept: 'application/json',
                },
            });
            const rawData = response.data.props.products;
            setAllProducts((prev: any) => {
                const existingIds = new Set(prev.map((p: any) => p.id));
                const uniqueNewProducts = getProductsArray(rawData).filter(
                    (p: any) => !existingIds.has(p.id),
                );

                return [...prev, ...uniqueNewProducts];
            });
            setNextPageUrl(getNextUrl(rawData));
        } catch (error) {
            console.error('Failed to load more products.', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-rose-200 selection:text-rose-900">
            <Head title={t('Flash Sale - Soko')} />

            <SimpleNavbar />

            <main className="relative overflow-hidden pt-28 pb-24">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* --- HERO BANNER --- */}
                    <div className="relative mb-10 overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 shadow-2xl sm:px-12 sm:py-20 lg:px-16">
                        <div className="absolute inset-0 bg-linear-to-br from-rose-600/20 to-orange-500/20"></div>
                        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-rose-500/30 blur-3xl"></div>
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-rose-400 ring-1 ring-white/20 backdrop-blur-md">
                                <Flame size={32} className="animate-pulse" />
                            </div>
                            <h1 className="mb-6 text-4xl leading-tight font-black tracking-tight text-white sm:text-5xl md:text-6xl">
                                {t('Exclusive')}{' '}
                                <span className="bg-linear-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                                    {t('Flash Sale')}
                                </span>
                            </h1>
                            <p className="text-base font-medium text-slate-300 sm:text-lg">
                                {t(
                                    'Get premium digital assets at a massive discount. These offers are available for a limited time only!',
                                )}
                            </p>
                        </div>
                    </div>

                    {/* --- TOOLBAR PENCARIAN & FILTER (LEFT ALIGNED) --- */}
                    <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-start lg:gap-6">
                        {/* 1. Baris Pencarian & Sort */}
                        <form
                            onSubmit={handleFilter}
                            className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto"
                        >
                            <div className="relative w-full shrink-0 sm:w-80 lg:w-80 xl:w-100">
                                <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={t('Search deals...')}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);

                                        if (e.target.value === '') {
                                            router.get(
                                                '/flash-sale',
                                                {
                                                    search: '',
                                                    category: categorySlug,
                                                    sort,
                                                },
                                                {
                                                    preserveState: true,
                                                    replace: true,
                                                    preserveScroll: true,
                                                },
                                            );
                                        }
                                    }}
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>

                            <div className="relative shrink-0 sm:w-40">
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        router.get(
                                            '/flash-sale',
                                            {
                                                search,
                                                category: categorySlug,
                                                sort: e.target.value,
                                            },
                                            {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true,
                                            },
                                        );
                                    }}
                                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                >
                                    <option value="newest">
                                        {t('Newest Arrivals')}
                                    </option>
                                    <option value="price_asc">
                                        {t('Lowest Price')}
                                    </option>
                                    <option value="price_desc">
                                        {t('Highest Price')}
                                    </option>
                                    <option value="rating_desc">
                                        {t('Top Rated')}
                                    </option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                            <button
                                type="submit"
                                className="hidden"
                                aria-label="Submit search"
                            ></button>
                        </form>

                        {/* Garis pemisah vertikal */}
                        <div className="hidden h-8 w-px shrink-0 bg-slate-200 lg:block"></div>

                        {/* 2. Kategori Pills (Mengisi sisa ruang ke kanan) */}
                        <div className="w-full overflow-hidden lg:w-auto lg:flex-1">
                            <div className="w-full overflow-x-auto mask-[linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                <div className="flex h-12 w-max items-center gap-2 px-4">
                                    <button
                                        onClick={() => handleCategoryClick('')}
                                        className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                                            categorySlug === ''
                                                ? 'bg-rose-100 text-rose-700 shadow-sm ring-1 ring-rose-200/50'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {t('Semua')}
                                    </button>
                                    {categories?.map((cat: any) => (
                                        <button
                                            key={cat.id}
                                            onClick={() =>
                                                handleCategoryClick(cat.slug)
                                            }
                                            className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                                                categorySlug === cat.slug
                                                    ? 'bg-rose-100 text-rose-700 shadow-sm ring-1 ring-rose-200/50'
                                                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- PRODUCT GRID --- */}
                    {allProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-rose-200 bg-white/50 py-24 text-center">
                            <Flame className="mb-4 h-12 w-12 text-rose-300" />
                            <h3 className="text-lg font-bold text-slate-900">
                                {t('No discounted products found')}
                            </h3>
                            <p className="mt-1 text-slate-500">
                                {t(
                                    'Try adjusting your filters or search term.',
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
                            {allProducts.map((product: any) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    auth={auth}
                                />
                            ))}
                        </div>
                    )}

                    {/* --- LOAD MORE BUTTON --- */}
                    {nextPageUrl && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="flex items-center justify-center gap-2 rounded-full border-2 border-rose-200 bg-white px-8 py-3 text-sm font-bold text-rose-600 shadow-sm transition-all hover:border-rose-600 hover:bg-rose-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoadingMore ? (
                                    <Spinner className="h-5 w-5 text-rose-600" />
                                ) : (
                                    t('Load More Deals')
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <BackToTop />
        </div>
    );
}
