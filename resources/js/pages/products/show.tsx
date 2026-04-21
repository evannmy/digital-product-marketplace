import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import AppLayout from '../../layouts/app-layout';

export default function Show({ product, hasPurchased }: any) {
    const { auth } = usePage().props as any;

    const { data, setData, post, processing } = useForm({
        rating: 5,
        comment: '',
    });

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/products/${product.id}/reviews`);
    };

    const addToCart = () => {
        router.post(
            route('cart.store'),
            {
                product_id: product.id,
            },
            {
                preserveScroll: true, // Don't jump to the top of the page
            },
        );
    };

    return (
        <AppLayout>
            <Head title={product.title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <div className="mb-6">
                        <Link
                            href="/products"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            &larr; Back to Marketplace
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-8 md:flex md:gap-8">
                            {/* Left Column: Product Details */}
                            <div className="md:w-2/3">
                                <div className="mb-2 text-sm font-semibold text-blue-600">
                                    {product.category.name}
                                </div>
                                <h1 className="mb-4 text-3xl font-bold text-gray-900">
                                    {product.title}
                                </h1>
                                {product.image_path && (
                                    <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                                        <img
                                            src={`/storage/${product.image_path}`}
                                            alt={product.title}
                                            className="h-auto max-h-125 w-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="prose mb-8 max-w-none text-gray-700">
                                    <p className="whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                </div>
                                {/* --- REVIEWS SECTION --- */}
                                <div className="mt-12 overflow-hidden border border-gray-100 bg-white p-8 shadow-sm sm:rounded-lg">
                                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                                        Customer Reviews
                                    </h2>

                                    {/* Review Submission Form (Only show if logged in) */}
                                    {auth.user && (
                                        <form
                                            onSubmit={submitReview}
                                            className="mb-10 rounded-lg border border-gray-200 bg-gray-50 p-6"
                                        >
                                            <h3 className="mb-4 font-semibold text-gray-900">
                                                Write a Review
                                            </h3>
                                            <div className="mb-4">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Rating (1-5)
                                                </label>
                                                <select
                                                    value={data.rating}
                                                    onChange={(e) =>
                                                        setData(
                                                            'rating',
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                >
                                                    {[5, 4, 3, 2, 1].map(
                                                        (num) => (
                                                            <option
                                                                key={num}
                                                                value={num}
                                                            >
                                                                {num} Stars
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                                    Comment (Optional)
                                                </label>
                                                <textarea
                                                    value={data.comment}
                                                    onChange={(e) =>
                                                        setData(
                                                            'comment',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    placeholder="What did you think of this product?"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-md bg-gray-900 px-4 py-2 text-white transition hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                Submit Review
                                            </button>
                                        </form>
                                    )}

                                    {/* Display Existing Reviews */}
                                    <div className="space-y-6">
                                        {product.reviews.length === 0 ? (
                                            <p className="text-gray-500 italic">
                                                No reviews yet. Be the first to
                                                review!
                                            </p>
                                        ) : (
                                            product.reviews.map(
                                                (review: any) => (
                                                    <div
                                                        key={review.id}
                                                        className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                                                    >
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <div className="font-bold text-gray-900">
                                                                {
                                                                    review.user
                                                                        .name
                                                                }
                                                            </div>
                                                            <div className="text-yellow-400">
                                                                {'★'.repeat(
                                                                    review.rating,
                                                                )}
                                                                <span className="text-gray-300">
                                                                    {'★'.repeat(
                                                                        5 -
                                                                            review.rating,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-gray-600">
                                                                {review.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                ),
                                            )
                                        )}
                                    </div>
                                </div>
                                {/* --- END REVIEWS SECTION --- */}
                            </div>

                            {/* Right Column: Purchasing Block */}
                            <div className="mt-8 md:mt-0 md:w-1/3">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                                    <div className="mb-4 text-3xl font-bold text-green-600">
                                        Rp{' '}
                                        {product.price.toLocaleString('id-ID')}
                                    </div>
                                    <div className="mb-6 text-sm text-gray-600">
                                        <p className="mb-6 text-sm text-gray-500">
                                            Created by:{' '}
                                            <Link
                                                href={`/creator/${product.seller.id}`}
                                                className="font-semibold text-blue-600 hover:underline"
                                            >
                                                {product.seller.name}
                                            </Link>
                                        </p>
                                        <p className="mt-1">
                                            Status:{' '}
                                            {product.is_active
                                                ? 'Available for download'
                                                : 'Unavailable'}
                                        </p>
                                    </div>

                                    {/* Action Buttons Logic */}
                                    <div className="mt-6 flex flex-col gap-3">
                                        {' '}
                                        {/* Added flex gap for spacing */}
                                        {auth.user &&
                                        auth.user.id === product.seller_id ? (
                                            <div className="rounded border border-gray-200 bg-gray-100 px-4 py-3 text-center font-medium text-gray-600">
                                                You own this product
                                            </div>
                                        ) : hasPurchased ? (
                                            <a
                                                href={`/products/${product.id}/download`}
                                                className="block w-full rounded bg-green-600 px-4 py-3 text-center font-semibold text-white transition duration-150 hover:bg-green-700"
                                            >
                                                Download Your Product
                                            </a>
                                        ) : product.is_active ? (
                                            <>
                                                {/* 3. The new Add to Cart Button */}
                                                <button
                                                    onClick={addToCart}
                                                    className="flex w-full items-center justify-center gap-2 rounded border-2 border-blue-600 bg-white px-4 py-3 font-semibold text-blue-600 transition duration-150 hover:bg-blue-50"
                                                >
                                                    <ShoppingBag className="h-5 w-5" />
                                                    Add to Cart
                                                </button>

                                                {/* Your existing direct checkout button */}
                                                <Link
                                                    href={`/products/${product.id}/checkout`}
                                                    method="post"
                                                    as="button"
                                                    className="w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white transition duration-150 hover:bg-blue-700"
                                                >
                                                    Buy It Now
                                                </Link>
                                            </>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full cursor-not-allowed rounded bg-gray-400 px-4 py-3 font-semibold text-white"
                                            >
                                                Currently Unavailable
                                            </button>
                                        )}
                                    </div>

                                    {/* Edit and Delete buttons only appear for the product owner */}
                                    {auth.user &&
                                        auth.user.id === product.seller_id && (
                                            <div className="mt-4 border-t border-gray-200 pt-4">
                                                <Link
                                                    href={`/products/${product.id}/edit`}
                                                    className="mb-2 block w-full rounded bg-gray-100 px-4 py-2 text-center font-semibold text-gray-700 transition duration-150 hover:bg-gray-200"
                                                >
                                                    Edit Product
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                'Are you sure you want to delete this product? This action cannot be undone and the file will be permanently erased.',
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/products/${product.id}`,
                                                            );
                                                        }
                                                    }}
                                                    className="block w-full rounded bg-red-50 px-4 py-2 text-center font-semibold text-red-600 transition duration-150 hover:bg-red-100"
                                                >
                                                    Delete Product
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
