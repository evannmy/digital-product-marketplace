import { usePage } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    // 1. Extract the flash object from the global page props
    const { flash } = usePage().props as any;

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {/* --- GLOBAL NOTIFICATION SYSTEM --- */}
            {/* We place this right inside the template, just above the children (page content) */}
            <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
                {flash?.success && (
                    <div
                        className="relative mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700 shadow-sm"
                        role="alert"
                    >
                        <span className="block sm:inline">{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div
                        className="relative mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 shadow-sm"
                        role="alert"
                    >
                        <span className="block sm:inline">{flash.error}</span>
                    </div>
                )}
            </div>
            {/* --- END NOTIFICATION SYSTEM --- */}

            {/* The actual page content loads here */}
            {children}
        </AppLayoutTemplate>
    );
};
