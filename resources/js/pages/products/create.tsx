import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../layouts/app-layout';

export default function Create({ categories }: any) {
    // Initialize the Inertia form state
    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        price: '',
        category_id: '',
        file: null as any, // Placeholder for the actual digital file
    });

    const submit = (e: any) => {
        e.preventDefault();
        // Submits the data to the POST /products route
        post('/products'); 
    };

    return (
        <AppLayout>
            <Head title="Create Product" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Upload Digital Product</h2>
                        <Link href="/products" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                            Cancel
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Title Field */}
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

                            {/* Category Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((category: any) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Field */}
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

                            {/* Description Field */}
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

                            {/* File Upload Mockup */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Digital File</label>
                                <input 
                                    type="file" 
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={e => setData('file', e.target.files ? e.target.files[0] : null)}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 border-t border-gray-200">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Publishing...' : 'Publish Product'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}