import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Package,
    ArrowRight,
    Sparkles,
    ChevronDown,
    Search,
    Star,
    Award,
    User,
    Image as ImageIcon,
} from 'lucide-react';
import { useState, useRef } from 'react';
import Navbar from '@/components/navbar';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

// --- NEW: Isolated Creator Card Component with Smart Media States ---
function CreatorCard({ creator, auth, getBannerGradient }: any) {
    const { t } = useTranslation(); // Inject translator here

    const [coverStatus, setCoverStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');
    const [avatarStatus, setAvatarStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');

    return (
        <Link
            href={`/creators/@${creator.username}`}
            className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white text-left ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/10 hover:ring-purple-300"
        >
            {/* --- SMART BANNER AREA --- */}
            <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                {creator.cover_photo_path ? (
                    coverStatus === 'error' ? (
                        <div className="flex h-full w-full items-center justify-center bg-slate-200/50 text-slate-400">
                            <ImageIcon size={24} className="opacity-50" />
                        </div>
                    ) : (
                        <img
                            src={
                                creator.cover_photo_path.startsWith('http')
                                    ? creator.cover_photo_path
                                    : `/storage/${creator.cover_photo_path}`
                            }
                            alt={`${creator.name} Cover`}
                            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${coverStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setCoverStatus('loaded')}
                            onError={() => setCoverStatus('error')}
                        />
                    )
                ) : (
                    <div
                        className={`h-full w-full bg-linear-to-br ${getBannerGradient(creator.id)} transition-transform duration-700 group-hover:scale-105`}
                    />
                )}
            </div>

            {/* --- SMART AVATAR AREA --- */}
            <div className="relative -mt-10 flex px-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                    {creator.avatar_path ? (
                        avatarStatus === 'error' ? (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
                                <User size={32} />
                            </div>
                        ) : (
                            <img
                                src={
                                    creator.avatar_path.startsWith('http')
                                        ? creator.avatar_path
                                        : `/storage/${creator.avatar_path}`
                                }
                                alt={creator.name}
                                className={`h-full w-full object-cover transition-opacity duration-300 ${avatarStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setAvatarStatus('loaded')}
                                onError={() => setAvatarStatus('error')}
                            />
                        )
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 text-2xl font-black text-slate-400">
                            {creator.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {Number(creator.received_reviews_avg_rating) >= 4.8 && (
                    <div className="absolute -top-1 left-20 ml-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center justify-center rounded-full bg-amber-400 p-1.5 text-white shadow-inner shadow-amber-600/50">
                            <Award size={12} className="fill-white" />
                        </div>
                    </div>
                )}
            </div>

            {/* --- CARD CONTENT --- */}
            <div className="flex grow flex-col px-6 pt-4 pb-6">
                <div className="flex items-center gap-2">
                    <h3 className="line-clamp-1 text-xl font-black text-slate-900 transition-colors group-hover:text-purple-700">
                        {creator.name}
                    </h3>
                    {auth?.user?.id === creator.id && (
                        <span className="shrink-0 rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-purple-700 uppercase ring-1 ring-purple-500/20 ring-inset">
                            {t('You')}
                        </span>
                    )}
                </div>
                <p className="mt-0.5 text-sm font-medium text-slate-400 transition-colors group-hover:text-purple-500">
                    @{creator.username}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold tracking-wide text-indigo-600 ring-1 ring-indigo-500/10 ring-inset">
                        <Package size={14} />
                        {creator.products_count}{' '}
                        {creator.products_count !== 1
                            ? t('Products')
                            : t('Product')}
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold tracking-wide text-amber-700 ring-1 ring-amber-500/20 ring-inset">
                        <Star
                            size={14}
                            className={
                                creator.received_reviews_avg_rating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-amber-300'
                            }
                        />
                        {creator.received_reviews_avg_rating
                            ? Number(
                                  creator.received_reviews_avg_rating,
                              ).toFixed(1)
                            : t('New Creator')}
                    </div>
                </div>

                <div className="mt-8 flex w-full items-center justify-between border-t border-slate-100 pt-5 text-sm font-bold text-slate-400 transition-colors group-hover:text-purple-600">
                    <span>{t('Explore Collection')}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-purple-50">
                        <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function CreatorsIndex({ creators, filters }: any) {
    const { t } = useTranslation(); // Inject translator here
    const { auth } = usePage().props as any;

    const [search, setSearch] = useState(filters?.search || '');
    const [sort, setSort] = useState(filters?.sort || 'products_desc');

    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/creators',
            { search, sort },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const getBannerGradient = (id: number) => {
        const gradients = [
            'from-fuchsia-100 via-purple-100 to-indigo-100',
            'from-emerald-100 via-teal-100 to-cyan-100',
            'from-rose-100 via-orange-100 to-amber-100',
            'from-blue-100 via-indigo-100 to-violet-100',
            'from-pink-100 via-rose-100 to-red-100',
        ];

        return gradients[id % gradients.length];
    };

    return (
        <>
            <Head title={t('Discover Creators - Soko')} />

            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                <Navbar />

                <main className="relative overflow-hidden pt-32 pb-24">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* HEADER */}
                        <div className="mb-12 flex flex-col items-center justify-center text-center sm:mb-16">
                            <h1 className="mx-auto mb-6 max-w-3xl text-4xl leading-tight font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                                {t('Meet our top')}{' '}
                                <span className="bg-linear-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                                    {t('Creators')}
                                </span>
                            </h1>

                            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
                                {t(
                                    'Discover the talented developers, designers, and artists building the future of digital products.',
                                )}
                            </p>
                        </div>

                        {/* SEARCH & FILTER SECTION */}
                        <div className="mx-auto mb-16 max-w-5xl">
                            <form
                                onSubmit={handleFilter}
                                className="relative z-10 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg ring-1 shadow-purple-900/5 ring-slate-200/60 sm:flex-row sm:items-center"
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
                                        placeholder={t(
                                            'Search creators by name...',
                                        )}
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
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
                                                '/creators',
                                                {
                                                    search,
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
                                        <option value="products_desc">
                                            {t('Most Products')}
                                        </option>
                                        <option value="rating_desc">
                                            {t('Highest Rated')}
                                        </option>
                                        <option value="newest">
                                            {t('Newest Creators')}
                                        </option>
                                        <option value="name_asc">
                                            {t('Name (A-Z)')}
                                        </option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>

                                <button
                                    type="submit"
                                    className="flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-bold text-white transition-all hover:bg-purple-600 sm:w-auto"
                                >
                                    {t('Search')}
                                </button>
                            </form>
                        </div>

                        {/* CREATORS GRID */}
                        {creators.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/60 bg-white/50 py-20 backdrop-blur-sm">
                                <Sparkles className="mb-4 h-12 w-12 text-purple-300" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    {t('No creators found')}
                                </h3>
                                <p className="text-slate-500">
                                    {t('Try adjusting your search filters.')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {creators.data.map((creator: any) => (
                                    <CreatorCard
                                        key={creator.id}
                                        creator={creator}
                                        auth={auth}
                                        getBannerGradient={getBannerGradient}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
