import { CheckCircle, Trash2, X, AlertTriangle } from 'lucide-react';

interface ToastProps {
    show: boolean;
    message: string;
    onClose: () => void;
    type?: 'success' | 'delete' | 'error';
    showCartLink?: boolean;
}

export default function Toast({
    show,
    message,
    onClose,
    type = 'success',
}: ToastProps) {
    // 1. Dictionary for the outer border and shadow glows
    const wrapperStyles = {
        success: 'border-emerald-100 shadow-emerald-900/10',
        delete: 'border-rose-100 shadow-rose-900/10',
        error: 'border-orange-100 shadow-orange-900/10',
    };

    // 2. Dictionary for the icon background and text colors
    const iconBoxStyles = {
        success: 'bg-emerald-50 text-emerald-500',
        delete: 'bg-rose-50 text-rose-500',
        error: 'bg-orange-50 text-orange-500',
    };

    // 3. Dictionary to map the perfect Lucide icon!
    const icons = {
        success: <CheckCircle size={24} />,
        delete: <Trash2 size={24} />,
        error: <AlertTriangle size={24} />,
    };

    return (
        <div
            className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ease-in-out sm:right-10 sm:bottom-10 ${
                show
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-8 opacity-0'
            }`}
        >
            <div
                // Applied the wrapper style dictionary here
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 pr-5 shadow-xl ring-1 ring-black/5 ${wrapperStyles[type]}`}
            >
                <div
                    // Applied the icon box style dictionary here
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBoxStyles[type]}`}
                >
                    {/* Instantly renders the correct icon! */}
                    {icons[type]}
                </div>

                <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-900">
                        {message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="ml-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
