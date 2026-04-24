import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in - Soko Marketplace" />

            {/* Global Background matching the Welcome Page */}
            <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900">
                {/* Fixed Top Navigation */}
                <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-slate-100 bg-white/70 px-8 py-6 backdrop-blur-md">
                    <div className="text-2xl font-black tracking-tighter">
                        Soko<span className="text-indigo-400">.</span>
                    </div>
                    <div className="space-x-6 text-sm font-medium">
                        <Link
                            href="/"
                            className="text-slate-600 transition-colors hover:text-indigo-500"
                        >
                            Home
                        </Link>
                        {canRegister && (
                            <Link
                                href={register()}
                                className="inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-white shadow-sm transition-all hover:bg-slate-800"
                            >
                                Start Selling
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Main Login Form Container */}
                <main className="flex flex-1 items-center justify-center px-4 pt-24 pb-12 sm:px-6">
                    <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
                        {/* Header Section with Gradient Typography */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">
                                Log in to your{' '}
                                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Account
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500">
                                Enter your email and password below to log in
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50 py-3 text-center text-sm font-medium text-indigo-700">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="font-semibold text-slate-700"
                                            >
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                                className="border-slate-200 bg-slate-50 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label
                                                    htmlFor="password"
                                                    className="font-semibold text-slate-700"
                                                >
                                                    Password
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-sm font-medium text-indigo-500 hover:text-indigo-600"
                                                        tabIndex={5}
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                                className="border-slate-200 bg-slate-50 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="mt-1 flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                                className="border-slate-300 text-indigo-600 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="cursor-pointer font-normal text-slate-600"
                                            >
                                                Remember me
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-2 w-full rounded-xl bg-slate-900 py-6 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && (
                                                <Spinner className="mr-2" />
                                            )}
                                            Log in
                                        </Button>
                                    </div>

                                    {canRegister && (
                                        <div className="mt-2 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                                            Don't have an account?{' '}
                                            <TextLink
                                                href={register()}
                                                tabIndex={5}
                                                className="font-bold text-indigo-600 hover:text-indigo-700"
                                            >
                                                Sign up
                                            </TextLink>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>
                </main>
            </div>
        </>
    );
}
