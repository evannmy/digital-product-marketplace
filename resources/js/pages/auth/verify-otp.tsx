import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import SimpleNavbar from '@/components/simple-navbar';
import { Spinner } from '@/components/ui/spinner';

export default function VerifyOtp() {
    const { flash, pendingEmail } = usePage().props as any;

    const displayEmail = pendingEmail || 'your email';

    const [countdown, setCountdown] = useState(0);
    // Tambahkan state untuk mengatur mode edit email
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    // Form untuk OTP
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const {
        data: emailData,
        setData: setEmailData,
        post: postEmail,
        processing: processingEmail,
        errors: emailErrors,
    } = useForm({
        email: displayEmail !== 'your email' ? displayEmail : '',
    });

    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;

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
        if (e.key === 'Backspace') {
            if (otpValues[index] !== '') {
                e.preventDefault();
                const newOtp = [...otpValues];
                newOtp[index] = '';
                setOtpValues(newOtp);
                setData('code', newOtp.join(''));
            } else if (index > 0) {
                e.preventDefault();
                inputRefs.current[index - 1]?.focus();
            }
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

    // Handler untuk form update email
    const submitUpdateEmail = (e: React.FormEvent) => {
        e.preventDefault();
        postEmail('/verify-otp/update-email', {
            onSuccess: () => {
                setIsEditingEmail(false);
                setCountdown(60); // Mulai ulang timer karena OTP baru dikirim
                setOtpValues(['', '', '', '', '', '']); // Kosongkan kolom OTP
                setData('code', '');
            },
        });
    };

    const handleResend = () => {
        if (countdown > 0) return;

        router.post(
            '/verify-otp/resend',
            {},
            {
                onSuccess: () => setCountdown(60),
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

            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                <SimpleNavbar />

                <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-32 pb-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
                                Verify{' '}
                                <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Account
                                </span>
                            </h1>

                            {/* --- BAGIAN YANG DIPERBARUI --- */}
                            <p className="text-sm leading-relaxed text-slate-500">
                                We've sent a 6-digit security code to:
                            </p>

                            <div className="mx-auto my-3 inline-block rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-base font-bold break-all text-slate-800 shadow-sm">
                                {displayEmail}
                            </div>

                            <p className="text-sm leading-relaxed text-slate-500">
                                Enter it below to unlock the marketplace.
                            </p>

                            <p className="mt-3 text-xs font-medium text-slate-400">
                                Can't find the email? Make sure to check your
                                spam or junk folder.
                            </p>
                            {/* ------------------------------- */}
                        </div>

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
                                            onFocus={(e) => e.target.select()}
                                            className="h-14 w-12 rounded-xl border border-slate-200 bg-slate-50/50 text-center text-2xl font-bold text-slate-900 caret-transparent shadow-sm transition-all focus:border-purple-400 focus:ring-0 focus:outline-none sm:h-16 sm:w-14"
                                            disabled={isEditingEmail}
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
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.code.length !== 6 ||
                                        isEditingEmail
                                    }
                                    className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                >
                                    {processing ? (
                                        <Spinner className="mr-2 h-5 w-5" />
                                    ) : null}
                                    Verify Account
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={
                                        countdown > 0 ||
                                        processing ||
                                        isEditingEmail
                                    }
                                    className={`cursor-pointer text-center text-sm font-medium transition-colors ${
                                        countdown > 0 || isEditingEmail
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

                        {/* --- BAGIAN BARU: Fitur Edit Email --- */}
                        <div className="mt-8 border-t border-slate-100 pt-6">
                            {!isEditingEmail ? (
                                <p className="text-center text-sm text-slate-500">
                                    Entered the wrong email?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingEmail(true)}
                                        className="cursor-pointer font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-purple-600"
                                    >
                                        Change email
                                    </button>
                                </p>
                            ) : (
                                <form
                                    onSubmit={submitUpdateEmail}
                                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                                >
                                    <label className="text-sm font-semibold text-slate-700">
                                        Update your email address
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={emailData.email}
                                            onChange={(e) =>
                                                setEmailData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter correct email"
                                            required
                                            className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:ring-0 focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={processingEmail}
                                            className="cursor-pointer rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {processingEmail
                                                ? 'Saving...'
                                                : 'Save'}
                                        </button>
                                    </div>
                                    {emailErrors.email && (
                                        <p className="text-xs font-medium text-rose-500">
                                            {emailErrors.email}
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingEmail(false)}
                                        className="cursor-pointer text-left text-xs font-medium text-slate-500 hover:text-slate-900"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
