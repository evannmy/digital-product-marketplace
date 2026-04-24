import { Head, Link } from '@inertiajs/react';

interface Props {
    auth: { user: any };
    // Tell TypeScript to expect the array of products from Laravel
    featuredProducts: any[];
}

export default function Welcome({ auth, featuredProducts }: Props) {
    return (
        <>
            <Head title="Welcome - Soko Marketplace" />

            {/* Minimalist Background with very subtle pastel tint */}
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900">
                {/* Clean Navigation Bar */}
                <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-slate-100 bg-white/70 px-8 py-6 backdrop-blur-md">
                    <div className="text-2xl font-black tracking-tighter">
                        Soko<span className="text-indigo-400">.</span>
                    </div>
                    <div className="space-x-6 text-sm font-medium">
                        {auth?.user ? (
                            <Link
                                href={route('products.index')}
                                className="text-slate-600 transition-colors hover:text-indigo-500"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-slate-600 transition-colors hover:text-indigo-500"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-white shadow-sm transition-all hover:bg-slate-800"
                                >
                                    Start Selling
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="mx-auto max-w-7xl px-6 pt-40 pb-20 text-center">
                    <div className="mb-8 inline-block rounded-full bg-indigo-100/80 px-4 py-1.5 text-xs font-bold tracking-wider text-indigo-700 uppercase">
                        The Premier Digital Marketplace
                    </div>

                    <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl">
                        Discover & Sell <br />
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Premium Digital Assets
                        </span>
                    </h1>

                    <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-500">
                        Join an elite community of creators. Buy high-quality
                        source code, UI kits, and templates, or set up your
                        storefront and monetize your own digital products today.
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href={route('register')}
                            className="rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                        >
                            Open a Storefront
                        </Link>
                        <Link
                            href="/products"
                            className="rounded-xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                </main>

                {/* Placeholder for Product Grid */}
                <section className="mx-auto max-w-7xl px-6 py-20">
                    <div className="mb-8 flex items-end justify-between">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Featured Products
                        </h2>
                        <a
                            href="/products"
                            className="font-medium text-indigo-500 transition-colors hover:text-indigo-600"
                        >
                            View all &rarr;
                        </a>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Check if we have products, if yes, map through them. If not, show a message. */}
                        {featuredProducts && featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl"
                                >
                                    {/* Placeholder Image Box (Add your actual image logic here later) */}
                                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100 text-slate-400">
                                        No Image
                                    </div>

                                    <div className="p-5">
                                        <h3 className="mb-1 truncate text-lg font-bold text-slate-900">
                                            {product.title}
                                        </h3>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-extrabold text-indigo-600">
                                                Rp{' '}
                                                {product.price?.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </span>
                                            <a
                                                href={`/products/${product.id}`}
                                                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
                                            >
                                                View Details &rarr;
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 py-12 text-center text-slate-500">
                                No featured products available yet.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
