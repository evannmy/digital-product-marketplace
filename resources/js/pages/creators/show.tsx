import { Head, Link } from '@inertiajs/react';
import {
    Package,
    Star,
    Calendar,
    Globe,
    Instagram,
    Github,
    PlayCircle,
    User,
    Image as ImageIcon,
} from 'lucide-react';
import { useState, useRef } from 'react';
import SimpleNavbar from '@/components/simple-navbar';
import { Spinner } from '@/components/ui/spinner';

// --- NEW: Isolated Product Card Component for the Creator Page ---
function CreatorProductCard({ product }: { product: any }) {
    const hasMedia = product.media && product.media.length > 0;

    // Each card gets its own state to handle loading and errors independently
    const [mediaStatus, setMediaStatus] = useState<
        'loading' | 'loaded' | 'error'
    >(hasMedia ? 'loading' : 'loaded');

    // Reference to control the video playback
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-left ring-1 ring-slate-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 hover:ring-purple-300"
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
                        <Package className="mb-2 h-8 w-8 opacity-50" />
                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase opacity-70">
                            Media Failed to Load
                        </span>
                    </div>
                )}

                {/* 3. ACTUAL MEDIA */}
                {hasMedia ? (
                    product.media[0].file_type === 'video' ? (
                        <div
                            className="group/video relative h-full w-full"
                            // Play on hover, pause & reset on leave
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
                                className={`h-full w-full rounded-lg object-cover shadow-sm transition-all duration-700 group-hover:scale-105 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                muted
                                playsInline
                                loop
                                preload="metadata"
                                onLoadedData={() => setMediaStatus('loaded')}
                                onError={() => setMediaStatus('error')}
                            />
                            {/* Play overlay fades out on group-hover/video */}
                            {mediaStatus === 'loaded' && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover/video:opacity-0">
                                    <PlayCircle className="h-12 w-12 text-white/80 drop-shadow-md" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <img
                            src={`/storage/${product.media[0].file_path}`}
                            alt={product.title}
                            className={`h-full w-full rounded-lg object-cover shadow-sm transition-all duration-700 group-hover:scale-105 ${mediaStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setMediaStatus('loaded')}
                            onError={() => setMediaStatus('error')}
                        />
                    )
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-purple-200">
                        <Package size={48} />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-20 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black tracking-wider text-purple-600 uppercase shadow-sm ring-1 ring-black/5 backdrop-blur-md">
                    {product.category?.name || 'Asset'}
                </div>
            </div>

            {/* Card Content */}
            <div className="flex grow flex-col p-6 sm:p-7">
                <h3 className="mb-3 line-clamp-2 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-purple-600">
                    {product.title}
                </h3>

                <div className="mb-8 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Star
                        size={14}
                        className={
                            product.reviews_avg_rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                        }
                    />
                    <span>
                        {product.reviews_avg_rating
                            ? Number(product.reviews_avg_rating).toFixed(1)
                            : 'New Release'}
                    </span>
                </div>

                {/* Footer Price Alignment */}
                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-5">
                    <div className="flex flex-col items-start">
                        {product.is_discount_active ? (
                            <>
                                <div className="mb-0.5 flex items-center gap-2">
                                    <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600 uppercase">
                                        Sale
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400 line-through">
                                        Rp{' '}
                                        {Number(product.price).toLocaleString(
                                            'id-ID',
                                        )}
                                    </span>
                                </div>
                                <span className="text-xl font-black tracking-tight text-rose-600">
                                    Rp{' '}
                                    {Math.round(
                                        Number(product.discount_price),
                                    ).toLocaleString('id-ID')}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="mb-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Price
                                </span>
                                <span className="text-xl font-black tracking-tight text-slate-900">
                                    Rp{' '}
                                    {product.price
                                        ? Number(product.price).toLocaleString(
                                              'id-ID',
                                          )
                                        : '0'}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function CreatorShow({ creator, products }: any) {
    const joinDate = new Date(creator.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const getBannerGradient = (id: number) => {
        const gradients = [
            'from-fuchsia-100 via-purple-100 to-indigo-100',
            'from-emerald-100 via-teal-100 to-cyan-100',
            'from-rose-100 via-orange-100 to-amber-100',
            'from-blue-100 via-indigo-100 to-violet-100',
            'from-pink-100 via-rose-100 to-red-100',
        ];

        return gradients[(id || 0) % gradients.length];
    };

    const [coverStatus, setCoverStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');
    const [avatarStatus, setAvatarStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');

    return (
        <>
            <Head title={`${creator.name}'s Store - Soko`} />

            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                <SimpleNavbar />

                <main className="relative z-10 flex-1 overflow-hidden pt-32 pb-24">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* CREATOR PROFILE BANNER */}
                        <div className="mb-16 overflow-hidden rounded-4xl border border-slate-200/60 bg-white/90 shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                            <div className="relative h-48 w-full overflow-hidden bg-slate-100 sm:h-64 lg:h-72">
                                {/* --- SMART BANNER RENDER --- */}
                                {creator.cover_photo_path ? (
                                    coverStatus === 'error' ? (
                                        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-200/50 text-slate-400">
                                            <ImageIcon
                                                size={32}
                                                className="mb-2 opacity-50"
                                            />
                                            <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                                                Banner Missing
                                            </span>
                                        </div>
                                    ) : (
                                        <img
                                            src={
                                                creator.cover_photo_path.startsWith(
                                                    'http',
                                                )
                                                    ? creator.cover_photo_path
                                                    : `/storage/${creator.cover_photo_path}`
                                            }
                                            alt={`${creator.name}'s Cover`}
                                            className={`h-full w-full object-cover transition-opacity duration-500 ${coverStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                            onLoad={() =>
                                                setCoverStatus('loaded')
                                            }
                                            onError={() =>
                                                setCoverStatus('error')
                                            }
                                        />
                                    )
                                ) : (
                                    <div
                                        className={`h-full w-full bg-linear-to-br ${getBannerGradient(creator.id)}`}
                                    />
                                )}
                            </div>

                            <div className="px-8 pt-0 pb-8 sm:px-12 sm:pb-12">
                                <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-8">
                                    <div className="relative -mt-16 flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-indigo-100 to-purple-200 text-5xl font-black text-purple-700 shadow-sm ring-4 ring-white sm:-mt-20 sm:h-40 sm:w-40 sm:text-6xl sm:ring-8">
                                        {/* --- SMART AVATAR RENDER --- */}
                                        {creator.avatar_path ? (
                                            avatarStatus === 'error' ? (
                                                <span className="text-slate-400">
                                                    <User
                                                        size={48}
                                                        className="opacity-50"
                                                    />
                                                </span>
                                            ) : (
                                                <img
                                                    src={
                                                        creator.avatar_path.startsWith(
                                                            'http',
                                                        )
                                                            ? creator.avatar_path
                                                            : `/storage/${creator.avatar_path}`
                                                    }
                                                    alt={creator.name}
                                                    className={`h-full w-full object-cover transition-opacity duration-500 ${avatarStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                                    onLoad={() =>
                                                        setAvatarStatus(
                                                            'loaded',
                                                        )
                                                    }
                                                    onError={() =>
                                                        setAvatarStatus('error')
                                                    }
                                                />
                                            )
                                        ) : (
                                            creator.name.charAt(0).toUpperCase()
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-col items-center text-center sm:items-start sm:text-left">
                                        <div className="mb-3">
                                            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                                                {creator.name}
                                            </h1>
                                            {creator.username && (
                                                <p className="mt-1 text-lg font-bold text-purple-600">
                                                    @{creator.username}
                                                </p>
                                            )}
                                        </div>

                                        <p className="mb-6 max-w-2xl text-base leading-relaxed text-slate-600">
                                            {creator.bio ||
                                                "This creator hasn't added a bio yet. Check out their awesome digital products below!"}
                                        </p>

                                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-slate-500 sm:justify-start">
                                            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                                                <Package
                                                    size={16}
                                                    className="text-indigo-500"
                                                />
                                                <span>
                                                    {creator.products_count}{' '}
                                                    Products
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                                                <Star
                                                    size={16}
                                                    className={
                                                        creator.received_reviews_avg_rating
                                                            ? 'fill-amber-400 text-amber-500'
                                                            : 'text-slate-400'
                                                    }
                                                />
                                                <span>
                                                    {creator.received_reviews_avg_rating
                                                        ? Number(
                                                              creator.received_reviews_avg_rating,
                                                          ).toFixed(1)
                                                        : 'No Ratings'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                                                <Calendar
                                                    size={16}
                                                    className="text-emerald-500"
                                                />
                                                <span>Joined {joinDate}</span>
                                            </div>

                                            {(creator.website ||
                                                creator.instagram ||
                                                creator.github) && (
                                                <>
                                                    <div className="hidden h-5 w-px bg-slate-200 sm:block"></div>
                                                    <div className="flex items-center gap-2">
                                                        {creator.website && (
                                                            <a
                                                                href={
                                                                    creator.website
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:scale-110 hover:bg-indigo-50 hover:text-indigo-600"
                                                            >
                                                                <Globe
                                                                    size={18}
                                                                />
                                                            </a>
                                                        )}
                                                        {creator.instagram && (
                                                            <a
                                                                href={`https://instagram.com/${creator.instagram}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:scale-110 hover:bg-pink-50 hover:text-pink-600"
                                                            >
                                                                <Instagram
                                                                    size={18}
                                                                />
                                                            </a>
                                                        )}
                                                        {creator.github && (
                                                            <a
                                                                href={`https://github.com/${creator.github}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:scale-110 hover:bg-slate-200 hover:text-slate-900"
                                                            >
                                                                <Github
                                                                    size={18}
                                                                />
                                                            </a>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION DIVIDER */}
                        <div className="mb-8 flex items-center justify-between border-b border-slate-200/60 pb-4">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                Collection by {creator.name}
                            </h2>
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                                {products.data.length} Items
                            </span>
                        </div>

                        {/* UPGRADED PRODUCTS GRID */}
                        {products.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-4xl border border-dashed border-slate-200 bg-white/50 py-24 text-center">
                                <Package className="mb-4 h-14 w-14 text-slate-300" />
                                <h3 className="text-xl font-bold text-slate-900">
                                    Store is empty
                                </h3>
                                <p className="mt-2 text-slate-500">
                                    This creator hasn't listed any active
                                    products yet. Check back soon!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
                                {products.data.map((product: any) => (
                                    <CreatorProductCard
                                        key={product.id}
                                        product={product}
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
