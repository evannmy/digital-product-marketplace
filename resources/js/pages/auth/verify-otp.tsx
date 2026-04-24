import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/spinner'; // Assuming you have this from previous files

export default function VerifyOtp() {
    const { flash } = usePage().props as any;

    const [countdown, setCountdown] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    // 1. Create an array to hold the 6 digits locally
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

    // 2. Create an array of references to control the DOM focus
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // 3. Handle typing
    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) {
            return;
        } // Only allow numbers

        const newOtp = [...otpValues];
        // Take the last character in case they type fast
        newOtp[index] = value.substring(value.length - 1);
        setOtpValues(newOtp);

        // Sync with Inertia's data state
        setData('code', newOtp.join(''));

        // Auto-advance to the next input
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // 4. Handle Backspace
    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            // If box is empty and they hit backspace, jump to previous box
            inputRefs.current[index - 1]?.focus();
        }
    };

    // 5. Handle Copy-Paste
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData('text')
            .replace(/[^0-9]/g, '')
            .slice(0, 6);

        if (pastedData) {
            const newOtp = [...otpValues];

            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }

            setOtpValues(newOtp);
            setData('code', newOtp.join(''));

            // Focus the next empty box, or the final box
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/verify-otp');
    };

    const handleResend = () => {
        if (countdown > 0) {
            return;
        }

        router.post(
            '/verify-otp/resend',
            {},
            {
                onSuccess: () => {
                    setCountdown(60);
                },
            },
        );
    };

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <>
            <Head title="Verify Email - Soko Marketplace" />

            {/* Global Background matching the Auth Flow */}
            <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900">
                {/* Fixed Top Navigation */}
                <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-slate-100 bg-white/70 px-8 py-6 backdrop-blur-md">
                    <div className="text-2xl font-black tracking-tighter">
                        Soko<span className="text-indigo-400">.</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/"
                            className="text-slate-600 transition-colors hover:text-indigo-500"
                        >
                            Home
                        </Link>
                    </div>
                </nav>

                {/* Main OTP Form Container */}
                <main className="flex flex-1 items-center justify-center px-4 pt-28 pb-12 sm:px-6">
                    <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
                        {/* Header Section with Gradient Typography */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">
                                Verify{' '}
                                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Account
                                </span>
                            </h1>
                            <p className="text-sm leading-relaxed text-slate-500">
                                We've sent a 6-digit security code to your
                                email. Enter it below to unlock the marketplace.
                            </p>
                        </div>

                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-700">
                                {flash.success}
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-center text-sm font-medium text-red-600">
                                {flash.error}
                            </div>
                        )}

                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div>
                                <label className="mb-4 block text-center text-sm font-semibold text-slate-700">
                                    Security Code
                                </label>

                                <div className="flex justify-center gap-2 sm:gap-4">
                                    {otpValues.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => {
                                                inputRefs.current[index] = el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(index, e)
                                            }
                                            onPaste={handlePaste}
                                            // Notice: We USE caret-transparent here!
                                            className="h-14 w-12 rounded-xl border-transparent bg-slate-50 text-center text-2xl font-bold text-slate-900 caret-transparent shadow-sm transition-all focus:border-2 focus:border-[#94B4D8] focus:ring-0 focus:outline-none sm:h-16 sm:w-14"
                                        />
                                    ))}
                                </div>

                                {errors.code && (
                                    <p className="mt-4 text-center text-sm font-medium text-red-500">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="mt-2 flex flex-col gap-4">
                                {/* Primary Action Button */}
                                <button
                                    type="submit"
                                    disabled={
                                        processing || data.code.length !== 6
                                    }
                                    className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    Verify Account
                                </button>

                                {/* Secondary Action (Resend) */}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || processing}
                                    className={`text-center text-sm font-medium transition-colors ${
                                        countdown > 0
                                            ? 'cursor-not-allowed text-slate-400'
                                            : 'text-indigo-600 underline decoration-indigo-200 underline-offset-4 hover:text-indigo-700 hover:decoration-indigo-600'
                                    }`}
                                >
                                    {countdown > 0
                                        ? `Resend code in ${countdown}s`
                                        : "Didn't receive it? Resend code"}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
