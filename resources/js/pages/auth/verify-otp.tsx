import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import SimpleNavbar from '@/components/simple-navbar';
import { Spinner } from '@/components/ui/spinner';

export default function VerifyOtp() {
    const { flash } = usePage().props as any;

    const [countdown, setCountdown] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) {
            return;
        }

        const newOtp = [...otpValues];
        newOtp[index] = value.substring(value.length - 1);
        setOtpValues(newOtp);
        setData('code', newOtp.join(''));

        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

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
            <Head title="Verify Email - Soko" />

            {/* Global Background matching the Auth Flow */}
            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                {/* --- HEADER --- */}
                <SimpleNavbar />

                {/* --- MAIN OTP FORM CONTAINER --- */}
                <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-32 pb-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
                                Verify{' '}
                                <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
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
                            <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">
                                {flash.success}
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 p-4 text-center text-sm font-semibold text-rose-600">
                                {flash.error}
                            </div>
                        )}

                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <div>
                                <label className="mb-4 block text-center text-sm font-bold text-slate-700">
                                    Security Code
                                </label>

                                {/* Upgraded OTP Inputs */}
                                <div className="flex justify-center gap-2 sm:gap-3">
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
                                            className="h-14 w-12 rounded-xl border border-slate-200 bg-slate-50/50 text-center text-2xl font-bold text-slate-900 caret-transparent shadow-sm transition-all focus:border-purple-400 focus:ring-0 focus:outline-none sm:h-16 sm:w-14"
                                        />
                                    ))}
                                </div>

                                {errors.code && (
                                    <p className="mt-4 text-center text-sm font-medium text-rose-500">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="mt-2 flex flex-col gap-5">
                                {/* Primary Action Button */}
                                <button
                                    type="submit"
                                    disabled={
                                        processing || data.code.length !== 6
                                    }
                                    className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                >
                                    {processing ? (
                                        <Spinner className="mr-2 h-5 w-5" />
                                    ) : null}
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
                                            : 'text-purple-600 underline decoration-purple-200 underline-offset-4 hover:text-purple-700 hover:decoration-purple-600'
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
