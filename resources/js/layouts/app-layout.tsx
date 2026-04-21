import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage().props as any;
    const [visible, setVisible] = useState(false);

    // 1. Auto-hide Lifecycle Hook
    useEffect(() => {
        if (flash?.success || flash?.error || flash?.info) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3000); // Hides after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {/* 2. Floating Notification System (Fixed Positioning) */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
                {visible && flash?.success && (
                    <div
                        className="relative rounded border border-green-400 bg-green-100 px-6 py-4 text-green-800 shadow-lg transition-all"
                        role="alert"
                    >
                        <span className="block font-medium sm:inline">
                            ✅ {flash.success}
                        </span>
                    </div>
                )}

                {visible && flash?.error && (
                    <div
                        className="relative rounded border border-red-400 bg-red-100 px-6 py-4 text-red-800 shadow-lg transition-all"
                        role="alert"
                    >
                        <span className="block font-medium sm:inline">
                            ❌ {flash.error}
                        </span>
                    </div>
                )}

                {/* 3. The Missing Info Block */}
                {visible && flash?.info && (
                    <div
                        className="relative rounded border border-blue-400 bg-blue-100 px-6 py-4 text-blue-800 shadow-lg transition-all"
                        role="alert"
                    >
                        <span className="block font-medium sm:inline">
                            ℹ️ {flash.info}
                        </span>
                    </div>
                )}
            </div>

            {/* The actual page content loads here */}
            {children}
        </AppLayoutTemplate>
    );
};
