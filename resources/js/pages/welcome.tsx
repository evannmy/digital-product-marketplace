import { Head, Link, router, usePage, useRemember } from '@inertiajs/react';
import axios from 'axios';
import { Search, ChevronDown, Sparkles, PlayCircle } from 'lucide-react';
// --- ADDED useMemo TO THE IMPORT ---
import { useState, useEffect, useRef, useMemo } from 'react';
import BackToTop from '@/components/back-to-top';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
import { Spinner } from '@/components/ui/spinner';

// --- Isolated Product Card Component ---
function ProductCard({ product, auth }: { product: any; auth: any }) {
    const hasMedia = product.media && product.media.length > 0;

    // Track main media status
    const [mediaStatus, setMediaStatus] = useState<
        'loading' | 'loaded' | 'error'
    >(hasMedia ? 'loading' : 'loaded');

    // Track avatar loading status
    const [avatarStatus, setAvatarStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');

    // Reference to control the video playback
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-left ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:ring-purple-200"
        >
            {/* --- SMART MEDIA AREA --- */}
            <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 to-indigo-50/50 p-6">
                {/* 1. LOADING STATE */}
                {mediaStatus === 'loading' && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                        <Spinner className="h-8 w-8 animate-spin text-purple-400" />
                    </div>
                )}

                {/* 2. ERROR STATE */}
                {mediaStatus === 'error' && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-purple-300">
                        <Sparkles className="mb-2 h-8 w-8 opacity-50" />
                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase opacity-70">
                            media failed to load
                        </span>
                    </div>
                )}

                {/* 3. ACTUAL MEDIA */}
                {hasMedia ? (
                    product.media[0].file_type === 'video' ? (
                        <div
                            className="group/video relative h-full w-full"
                            onMouseEnter={() => {
                                if (videoRef.current) {
                                    videoRef.current.play().catch(() => {});
                                }
                            }}
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
                    <div className="flex h-full w-full items-center justify-center text-purple-200">
                        <Sparkles size={32} />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-20 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold tracking-wider text-purple-600 uppercase shadow-sm ring-1 ring-black/5 backdrop-blur-md">
                    {product.category?.name || 'Asset'}
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex grow flex-col bg-white p-6 sm:p-7">
                <h3 className="mb-3 line-clamp-1 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-purple-600">
                    {product.title}
                </h3>

                <p className="mb-8 line-clamp-2 grow text-sm leading-relaxed text-slate-500">
                    {product.description ||
                        'Comprehensive digital asset package with full source code and documentation included.'}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-50 text-xs font-bold text-purple-600 ring-1 ring-purple-100">
                            {/* --- SMART AVATAR RENDER --- */}
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

                        <div className="flex min-w-0 flex-col items-start">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                Creator
                            </span>
                            <div className="flex w-full items-center gap-1.5">
                                <span className="truncate text-sm font-semibold text-slate-900">
                                    {product.seller?.name || 'Verified Seller'}
                                </span>

                                {auth?.user?.id === product.seller?.id && (
                                    <span className="shrink-0 rounded-md bg-purple-100 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-purple-700 uppercase ring-1 ring-purple-500/20 ring-inset">
                                        You
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

                    <div className="flex shrink-0 flex-col items-end">
                        {product.is_discount_active ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600 uppercase">
                                        Sale
                                    </span>
                                    <span className="text-xl font-black tracking-tight text-rose-600">
                                        Rp{' '}
                                        {Math.round(
                                            Number(product.discount_price),
                                        ).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-400 line-through">
                                    Rp{' '}
                                    {Number(product.price).toLocaleString(
                                        'id-ID',
                                    )}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-black tracking-tight text-slate-900">
                                Rp{' '}
                                {product.price
                                    ? Number(product.price).toLocaleString(
                                          'id-ID',
                                      )
                                    : '0'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Index({ products, categories, filters }: any) {
    const { version } = usePage() as any;
    const { flash, auth } = usePage().props as any;

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

    // --- FIXED: Wrapped in useMemo to prevent referential equality issues across renders ---
    const safeFilters = useMemo(() => {
        return Array.isArray(filters) ? {} : filters || {};
    }, [filters]);

    const [search, setSearch] = useRemember(
        safeFilters.search || '',
        'welcome-search',
    );
    const [categorySlug, setCategorySlug] = useRemember(
        safeFilters.category || '',
        'welcome-category',
    );
    const [sort, setSort] = useRemember(
        safeFilters.sort || 'newest',
        'welcome-sort',
    );

    const [allProducts, setAllProducts] = useRemember(
        getProductsArray(products),
        'welcome-products',
    );
    const [nextPageUrl, setNextPageUrl] = useRemember(
        getNextUrl(products),
        'welcome-next-url',
    );
    const [prevFilters, setPrevFilters] = useRemember(
        safeFilters,
        'welcome-prev-filters',
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
            '/',
            { search, category: categorySlug, sort },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleCategoryClick = (slug: string) => {
        setCategorySlug(slug);
        router.get(
            '/',
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
            const newProductsArray = getProductsArray(rawData);
            const newNextUrl = getNextUrl(rawData);

            setAllProducts((prev: any) => {
                const existingIds = new Set(prev.map((p: any) => p.id));
                const uniqueNewProducts = newProductsArray.filter(
                    (p: any) => !existingIds.has(p.id),
                );

                return [...prev, ...uniqueNewProducts];
            });

            setNextPageUrl(newNextUrl);
        } catch (error) {
            console.error('Failed to load more products.', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
            <Head title="Discover - Soko" />

            <Navbar />

            <main className="relative overflow-hidden pt-32 pb-24">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center sm:mb-16">
                        <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                            Everything you need to{' '}
                            <br className="hidden sm:block" />
                            <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                build and learn.
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 sm:text-xl">
                            Discover a curated library of premium design assets,
                            expert ebooks, and digital tools delivered instantly
                            to your workspace.
                        </p>
                    </div>

                    {auth?.user?.role !== 'seller' &&
                        auth?.user?.role !== 'admin' && (
                            <div
                                className={`mx-auto mt-6 mb-8 flex justify-center ${
                                    auth?.user
                                        ? 'min-[1000px]:hidden'
                                        : 'md:hidden'
                                }`}
                            >
                                <Link
                                    href={route('creator.onboarding')}
                                    className="group flex items-center rounded-full border border-purple-200 bg-purple-50/90 px-4 py-1.5 text-sm font-medium text-purple-800 transition-all hover:border-purple-300 hover:bg-purple-100 hover:shadow-sm sm:px-5 sm:py-2"
                                >
                                    <Sparkles
                                        size={16}
                                        className="mr-2 text-purple-500"
                                    />
                                    Are you a creator?{' '}
                                    <span className="ml-1.5 font-bold underline decoration-purple-300 underline-offset-4 transition-colors group-hover:decoration-purple-600">
                                        Start selling today &rarr;
                                    </span>
                                </Link>
                            </div>
                        )}

                    <div className="mx-auto mb-16 max-w-5xl">
                        <form
                            onSubmit={handleFilter}
                            className="relative z-10 mb-6 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg ring-1 shadow-purple-900/5 ring-slate-200/60 sm:flex-row sm:items-center"
                        >
                            <div className="relative grow">
                                <Search
                                    className="absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 cursor-text text-purple-300"
                                    onClick={() =>
                                        searchInputRef.current?.focus()
                                    }
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search by title or creator..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-12 w-full rounded-xl border-none bg-transparent pr-4 pl-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:ring-0 focus:outline-none"
                                />
                            </div>

                            <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>

                            <div className="relative shrink-0 sm:w-48">
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        router.get(
                                            '/',
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
                                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border-none bg-transparent px-5 pr-10 text-sm font-medium text-slate-600 focus:border-transparent focus:ring-0 focus:outline-none"
                                >
                                    <option value="newest">
                                        Newest Arrivals
                                    </option>
                                    <option value="price_asc">
                                        Lowest Price
                                    </option>
                                    <option value="price_desc">
                                        Highest Price
                                    </option>
                                    <option value="rating_desc">
                                        Top Rated
                                    </option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>

                            <button
                                type="submit"
                                className="flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-bold text-white transition-all hover:bg-purple-600 sm:w-auto"
                            >
                                Search
                            </button>
                        </form>

                        <div className="w-full">
                            <div className="relative mb-4 block md:hidden">
                                <select
                                    value={categorySlug}
                                    onChange={(e) =>
                                        handleCategoryClick(e.target.value)
                                    }
                                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-5 pr-10 text-sm font-semibold text-slate-700 shadow-sm focus:border-purple-400 focus:ring-0 focus:outline-none"
                                >
                                    <option value="">All</option>
                                    {categories &&
                                        categories.map((cat: any) => (
                                            <option
                                                key={cat.id}
                                                value={cat.slug}
                                            >
                                                {cat.name}
                                            </option>
                                        ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-5 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            </div>

                            <div className="relative mb-8 hidden w-full border-b border-slate-200/60 pb-6 md:block">
                                <div className="w-full overflow-x-auto mask-[linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="flex w-max items-center gap-8 px-4 py-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleCategoryClick('')
                                            }
                                            className={`shrink-0 cursor-pointer text-[15px] transition-all duration-300 ${
                                                categorySlug === ''
                                                    ? 'rounded-full bg-slate-900 px-5 py-2 font-medium text-white'
                                                    : 'font-medium text-slate-700 hover:text-slate-900'
                                            }`}
                                        >
                                            All
                                        </button>

                                        {categories &&
                                            categories.map((cat: any) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleCategoryClick(
                                                            cat.slug,
                                                        )
                                                    }
                                                    className={`shrink-0 cursor-pointer text-[15px] transition-all duration-300 ${
                                                        categorySlug ===
                                                        cat.slug
                                                            ? 'rounded-full bg-slate-900 px-5 py-2 font-medium text-white'
                                                            : 'font-medium text-slate-700 hover:text-slate-900'
                                                    }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- BENTO PRODUCT GRID --- */}
                    {allProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 py-24 text-center">
                            <Sparkles className="mb-4 h-12 w-12 text-slate-300" />
                            <h3 className="text-lg font-bold text-slate-900">
                                No products found
                            </h3>
                            <p className="mt-1 text-slate-500">
                                Try adjusting your filters or search term.
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
                                className="flex items-center justify-center gap-2 rounded-full border-2 border-purple-200 bg-white px-8 py-3 text-sm font-bold text-purple-600 shadow-sm transition-all hover:border-purple-600 hover:bg-purple-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <svg
                                            className="h-5 w-5 animate-spin text-purple-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    'Load More Products'
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
