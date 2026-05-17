import { Form, Head } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import SimpleNavbar from '@/components/simple-navbar';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [nameLength, setNameLength] = useState(0);
    const [usernameLength, setUsernameLength] = useState(0);

    // --- ADDED: Live Check State ---
    const [usernameValue, setUsernameValue] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<
        'idle' | 'checking' | 'available' | 'taken'
    >('idle');

    // --- ADDED: Debounced Effect ---
    useEffect(() => {
        let isMounted = true;

        if (!usernameValue || usernameValue.length < 3) {
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            if (isMounted) setUsernameStatus('checking');

            try {
                const response = await axios.post('/check-username', {
                    username: usernameValue,
                });

                if (isMounted) {
                    setUsernameStatus(
                        response.data.available ? 'available' : 'taken',
                    );
                }
            } catch {
                if (isMounted) setUsernameStatus('idle');
            }
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(delayDebounceFn);
        };
    }, [usernameValue]);

    return (
        <>
            <Head title="Register - Soko" />

            {/* Global Background matching the Discover & Login Pages */}
            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                {/* --- HEADER --- */}
                <SimpleNavbar />

                {/* --- MAIN REGISTER FORM CONTAINER --- */}
                <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-32 pb-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
                                Create an{' '}
                                <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Account
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500">
                                Enter your details below to set up your
                                storefront
                            </p>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                            disableWhileProcessing
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        {/* Full Name Input */}
                                        <div className="grid gap-2">
                                            <div className="flex items-end justify-between">
                                                <Label
                                                    htmlFor="name"
                                                    className="font-bold text-slate-700"
                                                >
                                                    Full Name
                                                </Label>
                                                <span
                                                    className={`text-xs font-bold ${nameLength >= 50 ? 'text-rose-500' : 'text-slate-400'}`}
                                                >
                                                    {nameLength}/50
                                                </span>
                                            </div>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                maxLength={50}
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                onChange={(e) =>
                                                    setNameLength(
                                                        e.target.value.length,
                                                    )
                                                }
                                                placeholder="e.g. John Doe"
                                                className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all autofill:shadow-[inset_0_0_0px_1000px_#faf5ff] autofill:[-webkit-text-fill-color:#0f172a] focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
                                            />
                                            <InputError
                                                message={errors.name}
                                                className="mt-1"
                                            />
                                        </div>

                                        {/* Username Input */}
                                        <div className="grid gap-2">
                                            <div className="flex items-end justify-between">
                                                <Label
                                                    htmlFor="username"
                                                    className="font-bold text-slate-700"
                                                >
                                                    Username
                                                </Label>
                                                <span
                                                    className={`text-xs font-bold ${usernameLength >= 30 ? 'text-rose-500' : 'text-slate-400'}`}
                                                >
                                                    {usernameLength}/30
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-400">
                                                    @
                                                </span>
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    required
                                                    maxLength={30}
                                                    tabIndex={2}
                                                    autoComplete="username"
                                                    name="username"
                                                    onChange={(e) => {
                                                        // Instantly strip spaces and lowercase the visual input
                                                        e.target.value =
                                                            e.target.value
                                                                .replace(
                                                                    /\s/g,
                                                                    '',
                                                                )
                                                                .toLowerCase();
                                                        setUsernameLength(
                                                            e.target.value
                                                                .length,
                                                        );
                                                        setUsernameValue(
                                                            e.target.value,
                                                        );
                                                        setUsernameStatus(
                                                            'idle',
                                                        );
                                                    }}
                                                    placeholder="yourbrand"
                                                    className={`h-12 w-full rounded-xl border bg-slate-50/50 pr-10 pl-9 shadow-sm transition-all autofill:shadow-[inset_0_0_0px_1000px_#faf5ff] autofill:[-webkit-text-fill-color:#0f172a] focus:bg-white focus:outline-none focus-visible:ring-0 ${
                                                        usernameStatus ===
                                                        'taken'
                                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                                                            : usernameStatus ===
                                                                'available'
                                                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500'
                                                              : 'border-slate-200 focus:border-purple-400'
                                                    }`}
                                                />
                                                {/* --- NEW: Dynamic Input Icons --- */}
                                                {usernameStatus ===
                                                    'checking' && (
                                                    <div className="absolute top-1/2 right-4 -translate-y-1/2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-purple-600"></div>
                                                    </div>
                                                )}
                                                {usernameStatus ===
                                                    'available' && (
                                                    <CheckCircle2
                                                        size={16}
                                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-500"
                                                    />
                                                )}
                                                {usernameStatus === 'taken' && (
                                                    <XCircle
                                                        size={16}
                                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-rose-500"
                                                    />
                                                )}
                                            </div>

                                            {/* --- NEW: Feedback Messages --- */}
                                            {usernameStatus === 'available' &&
                                                !errors.username && (
                                                    <p className="mt-1 text-xs font-bold text-emerald-600">
                                                        Looks good! This
                                                        username is available.
                                                    </p>
                                                )}
                                            {usernameStatus === 'taken' &&
                                                !errors.username && (
                                                    <p className="mt-1 text-xs font-bold text-rose-600">
                                                        This username is already
                                                        taken.
                                                    </p>
                                                )}
                                            <InputError
                                                message={errors.username}
                                                className="mt-1"
                                            />
                                        </div>

                                        {/* Email Input */}
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="font-bold text-slate-700"
                                            >
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={3}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all autofill:shadow-[inset_0_0_0px_1000px_#faf5ff] autofill:[-webkit-text-fill-color:#0f172a] focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
                                            />
                                            <InputError
                                                message={errors.email}
                                                className="mt-1"
                                            />
                                        </div>

                                        {/* Password Input */}
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password"
                                                className="font-bold text-slate-700"
                                            >
                                                Password
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Create a password"
                                                className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all autofill:shadow-[inset_0_0_0px_1000px_#faf5ff] autofill:[-webkit-text-fill-color:#0f172a] focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
                                            />
                                            <InputError
                                                message={errors.password}
                                                className="mt-1"
                                            />
                                        </div>

                                        {/* Confirm Password Input */}
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="font-bold text-slate-700"
                                            >
                                                Confirm password
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                required
                                                tabIndex={5}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Confirm password"
                                                className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all autofill:shadow-[inset_0_0_0px_1000px_#faf5ff] autofill:[-webkit-text-fill-color:#0f172a] focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                                className="mt-1"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                            tabIndex={6}
                                            disabled={
                                                processing ||
                                                usernameStatus === 'taken'
                                            } // Disable if taken
                                            data-test="register-user-button"
                                        >
                                            {processing ? (
                                                <Spinner className="mr-2 h-5 w-5" />
                                            ) : null}
                                            Create account
                                        </Button>
                                    </div>

                                    {/* Log In Link */}
                                    <div className="mt-2 border-t border-slate-100 pt-6 text-center text-sm font-medium text-slate-500">
                                        Already have an account?{' '}
                                        <TextLink
                                            href={login()}
                                            tabIndex={7}
                                            className="font-bold text-purple-600 transition-colors hover:text-purple-700"
                                        >
                                            Log in
                                        </TextLink>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </main>
            </div>
        </>
    );
}
