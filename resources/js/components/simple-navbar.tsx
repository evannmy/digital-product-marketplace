import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

// --- ADD THE PROP DEFINITION ---
type Props = {
    backUrl?: string;
    hideBackButton?: boolean; // <-- Added this new prop
};

export default function SimpleNavbar({
    backUrl,
    hideBackButton = false,
}: Props) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- MERGE EXPLICIT URL WITH HISTORY FALLBACK ---
    const handleBack = () => {
        if (backUrl) {
            // 1. If an explicit backUrl is passed (like for the payment page), use it.
            router.visit(backUrl);
        } else if (window.history.length > 1) {
            // 2. If they have history, go back to restore scroll.
            window.history.back();
        } else {
            // 3. If they opened the link directly in a new tab, fallback to home.
            router.visit('/');
        }
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'border-b border-slate-200/60 bg-white/80 py-3 shadow-sm backdrop-blur-xl'
                    : 'bg-transparent py-5'
            }`}
        >
            <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="group flex items-baseline">
                    <span className="text-2xl font-black tracking-tighter text-slate-900 transition-colors duration-300 group-hover:text-slate-700 sm:text-3xl">
                        soko
                    </span>
                    <span className="mb-1 ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-linear-to-tr from-indigo-400 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-300 sm:mb-1.25 sm:h-2 sm:w-2" />
                </Link>

                {/* --- CONDITIONALLY RENDER THE BACK BUTTON --- */}
                {!hideBackButton && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="group flex cursor-pointer items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur-md transition-all hover:bg-purple-50 hover:text-purple-700 hover:ring-purple-200"
                        >
                            <ArrowLeft
                                size={16}
                                className="transition-transform group-hover:-translate-x-1"
                            />
                            <span className="hidden sm:inline">Back</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
