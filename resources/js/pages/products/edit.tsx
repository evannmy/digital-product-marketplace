import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Edit({ product, categories }: any) {
    const { data, setData, post, processing } = useForm({
        title: product.title,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        file: null as any,
        image: null as any,
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(`/seller/products/${product.id}/update`);
    };

    return (
        <AppLayout>
            <Head title={`Edit - ${product.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Edit Product
                        </h2>
                        <Link
                            href={`/products/${product.id}`}
                            className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white p-8 shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Product Title
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData('category_id', e.target.value)
                                    }
                                    required
                                >
                                    {categories.map((category: any) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Price (IDR)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                                <label className="mb-2 block text-sm font-medium text-yellow-800">
                                    Update Digital File (Optional)
                                </label>
                                <p className="mb-3 text-xs text-yellow-700">
                                    Leave this blank if you don't want to modify
                                    the existing product file. Uploading a new
                                    file will delete your old file.
                                </p>
                                <input
                                    type="file"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-yellow-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-yellow-800 hover:file:bg-yellow-200"
                                    onChange={(e) =>
                                        setData(
                                            'file',
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                />
                            </div>

                            {/* Product Cover Image */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Cover Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={(e) =>
                                        setData(
                                            'image',
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Recommended size: 800x600px (JPG, PNG, WEBP)
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Updating...'
                                        : 'Update Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
