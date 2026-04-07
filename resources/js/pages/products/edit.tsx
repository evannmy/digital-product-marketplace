import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Edit({ product, categories }: any) {
    const { data, setData, post, processing } = useForm({
        title: product.title,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        file: null as any, 
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(`/products/${product.id}/update`); 
    };

    return (
        <AppLayout>
            <Head title={`Edit - ${product.title}`} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                        <Link href={`/products/${product.id}`} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                            Cancel
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Title</label>
                                <input 
                                    type="text" 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    required
                                >
                                    {categories.map((category: any) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price (IDR)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.price}
                                    onChange={e => setData('price', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea 
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <label className="block text-sm font-medium text-yellow-800 mb-2">
                                    Update Digital File (Optional)
                                </label>
                                <p className="text-xs text-yellow-700 mb-3">
                                    Leave this blank if you don't want to modify the existing product file. Uploading a new file will delete your old file.
                                </p>
                                <input 
                                    type="file" 
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200"
                                    onChange={e => setData('file', e.target.files ? e.target.files[0] : null)}
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Product'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}