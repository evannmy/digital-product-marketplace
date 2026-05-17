import { Link } from '@inertiajs/react';
import { CheckCircle, Trash2, X, AlertTriangle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

// --- 1. GLOBAL STATE TYPES ---
export type ToastType = 'success' | 'delete' | 'error' | 'info';

interface ToastData {
    message: string;
    type: ToastType;
    showCartLink?: boolean;
    id: number;
}

// Global listener to let the 'toast' function communicate with the '<Toaster />' component
let toastListener: ((data: ToastData) => void) | null = null;
let toastIdCounter = 0;

// --- 2. THE EXPORTED TOAST FUNCTION (The Engine) ---
export const toast = (
    message: string,
    type: ToastType = 'success',
    showCartLink = false,
) => {
    if (toastListener) {
        toastListener({ message, type, showCartLink, id: ++toastIdCounter });
    }
};

// --- 3. THE EXPORTED TOASTER COMPONENT (The UI) ---
export default function Toaster() {
    const [currentToast, setCurrentToast] = useState<ToastData | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // --- FIXED: Uses the native return type instead of NodeJS.Timeout ---
        let timeoutId: ReturnType<typeof setTimeout>;

        // Register the listener when the component mounts
        toastListener = (data: ToastData) => {
            setCurrentToast(data);
            setShow(true);

            // Clear any existing timer so rapid clicks don't close the toast instantly
            clearTimeout(timeoutId);

            // Auto-hide the toast after 3.5 seconds
            timeoutId = setTimeout(() => {
                setShow(false);
            }, 3500);
        };

        // Cleanup when the component unmounts
        return () => {
            toastListener = null;
            clearTimeout(timeoutId);
        };
    }, []);

    // Safe fallback type for rendering
    const type = currentToast?.type || 'success';

    // UI Dictionaries
    const wrapperStyles = {
        success: 'border-emerald-100 shadow-emerald-900/10',
        delete: 'border-rose-100 shadow-rose-900/10',
        error: 'border-orange-100 shadow-orange-900/10',
        info: 'border-blue-100 shadow-blue-900/10',
    };

    const iconBoxStyles = {
        success: 'bg-emerald-50 text-emerald-500',
        delete: 'bg-rose-50 text-rose-500',
        error: 'bg-orange-50 text-orange-500',
        info: 'bg-blue-50 text-blue-500',
    };

    const icons = {
        success: <CheckCircle size={24} />,
        delete: <Trash2 size={24} />,
        error: <AlertTriangle size={24} />,
        info: <Info size={24} />,
    };

    return (
        <div
            className={`fixed right-6 bottom-6 z-100 transition-all duration-300 ease-in-out sm:right-10 sm:bottom-10 ${
                show
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-8 opacity-0'
            }`}
        >
            <div
                role="alert"
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 pr-5 shadow-xl ring-1 ring-black/5 ${wrapperStyles[type]}`}
            >
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBoxStyles[type]}`}
                >
                    {icons[type]}
                </div>

                <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-900">
                        {currentToast?.message || ''}
                    </p>
                    {currentToast?.showCartLink && type === 'success' && (
                        <Link
                            href="/cart"
                            className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
                        >
                            View cart & checkout &rarr;
                        </Link>
                    )}
                </div>

                <button
                    onClick={() => setShow(false)}
                    className="ml-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
