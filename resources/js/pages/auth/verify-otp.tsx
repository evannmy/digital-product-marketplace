import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function VerifyOtp() {
    const { flash } = usePage().props as any;

    // We only need one state for the timer. If countdown > 0, it's disabled.
    const [countdown, setCountdown] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    // Fix 1: Use React.FormEvent inline
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/verify-otp');
    };

    const handleResend = () => {
        // Prevent clicking if the timer is still running
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

    // Fix 4: Simplified useEffect prevents the synchronous render warning
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

            // Fix 3: Added blank line before return
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-6 sm:justify-center sm:pt-0">
            <Head title="Verify Email - Soko" />

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-8 shadow-md sm:max-w-md sm:rounded-xl">
                <div className="mb-6 flex justify-center">
                    <h2 className="text-3xl font-bold tracking-tight text-blue-600">
                        Soko
                    </h2>
                </div>

                <div className="mb-6 text-center text-sm text-gray-600">
                    We've sent a 6-digit security code to your email address.
                    Please enter it below to verify your account and unlock the
                    marketplace.
                </div>

                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-600">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                        {flash.error}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mt-4">
                        <label
                            htmlFor="code"
                            className="mb-2 block text-center text-sm font-medium text-gray-700"
                        >
                            Security Code
                        </label>

                        <input
                            id="code"
                            type="text"
                            name="code"
                            value={data.code}
                            className="block w-full rounded-lg border-gray-300 py-3 text-center text-3xl font-bold tracking-[1em] shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            autoFocus
                            maxLength={6}
                            placeholder="------"
                            onChange={(e) => {
                                const value = e.target.value.replace(
                                    /[^0-9]/g,
                                    '',
                                );
                                setData('code', value);
                            }}
                        />

                        {errors.code && (
                            <p className="mt-2 text-center text-sm text-red-600">
                                {errors.code}
                            </p>
                        )}
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={countdown > 0 || processing}
                            className={`text-sm underline ${countdown > 0 ? 'cursor-not-allowed text-gray-400' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            {countdown > 0
                                ? `Resend code in ${countdown}s`
                                : 'Resend code'}
                        </button>

                        <button
                            type="submit"
                            disabled={processing || data.code.length !== 6}
                            className={`inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-xs font-semibold tracking-widest text-white uppercase transition duration-150 ease-in-out hover:bg-blue-700 focus:bg-blue-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none active:bg-blue-900 ${
                                (processing || data.code.length !== 6) &&
                                'cursor-not-allowed opacity-50'
                            }`}
                        >
                            Verify Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
