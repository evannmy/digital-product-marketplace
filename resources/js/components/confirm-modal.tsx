import {
    Trash2,
    Lock,
    Unlock,
    CheckCircle,
    X,
    Eye,
    EyeOff,
    UserX,
    UserCheck,
    XCircle,
    Loader2, // <-- NEW: Imported for the loading spinner
} from 'lucide-react';
import { useEffect } from 'react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isProcessing = false, // <-- NEW: Added processing state prop (defaults to false)
}: any) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isProcessing) return; // <-- NEW: Block keyboard actions while processing

            if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onConfirm, onClose, isProcessing]);

    if (!isOpen) return null;

    const variants = {
        danger: {
            icon: <Trash2 size={28} className="text-rose-600" />,
            bg: 'bg-rose-50',
            ring: 'ring-rose-50',
            btn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25',
        },
        warning: {
            icon: <Lock size={28} className="text-amber-600" />,
            bg: 'bg-amber-50',
            ring: 'ring-amber-50',
            btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25',
        },
        info: {
            icon: <Unlock size={28} className="text-indigo-600" />,
            bg: 'bg-indigo-50',
            ring: 'ring-indigo-50',
            btn: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25',
        },
        success: {
            icon: <CheckCircle size={28} className="text-emerald-600" />,
            bg: 'bg-emerald-50',
            ring: 'ring-emerald-50',
            btn: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25',
        },
        neutral: {
            icon: <EyeOff size={28} className="text-slate-600" />,
            bg: 'bg-slate-100',
            ring: 'ring-slate-50',
            btn: 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-700/25',
        },
        primary: {
            icon: <Eye size={28} className="text-indigo-600" />,
            bg: 'bg-indigo-50',
            ring: 'ring-indigo-50',
            btn: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25',
        },
        suspend: {
            icon: <UserX size={28} className="text-amber-600" />,
            bg: 'bg-amber-50',
            ring: 'ring-amber-50',
            btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25',
        },
        reactivate: {
            icon: <UserCheck size={28} className="text-emerald-600" />,
            bg: 'bg-emerald-50',
            ring: 'ring-emerald-50',
            btn: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25',
        },
        reject: {
            icon: <XCircle size={28} className="text-rose-600" />,
            bg: 'bg-rose-50',
            ring: 'ring-rose-50',
            btn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25',
        },
    };

    const theme = variants[variant as keyof typeof variants] || variants.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Background Overlay - Prevents clicking outside to close while processing */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={() => !isProcessing && onClose()}
            ></div>

            <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-xl transition-all sm:p-8">
                {/* Close Button - Disabled while processing */}
                <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="absolute top-4 right-4 text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                <div
                    className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${theme.bg} ring-8 ${theme.ring}`}
                >
                    {theme.icon}
                </div>

                <h3 className="mb-2 text-center text-xl font-black text-slate-900">
                    {title}
                </h3>

                <p className="mb-8 text-center text-sm leading-relaxed text-slate-500">
                    {message}
                </p>

                <div className="flex gap-3">
                    {/* Cancel Button - Disabled while processing */}
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="flex-1 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    {/* Confirm Button - Shows spinner and disables while processing */}
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${theme.btn} ${
                            isProcessing
                                ? 'cursor-not-allowed opacity-70 hover:translate-y-0 hover:shadow-none'
                                : 'hover:-translate-y-0.5 hover:shadow-lg'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
