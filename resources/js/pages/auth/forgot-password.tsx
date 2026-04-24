import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot Password - Soko Marketplace" />

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
                        <Link
                            href={login()}
                            className="inline-block rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600"
                        >
                            Log in
                        </Link>
                    </div>
                </nav>

                {/* Main Forgot Password Form Container */}
                <main className="flex flex-1 items-center justify-center px-4 pt-28 pb-12 sm:px-6">
                    <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
                        {/* Header Section with Gradient Typography */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">
                                Reset{' '}
                                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Password
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500">
                                Enter your email to receive a password reset
                                link
                            </p>
                        </div>

                        {/* Status Message (e.g., "We have emailed your password reset link.") */}
                        {status && (
                            <div className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50 py-3 text-center text-sm font-medium text-indigo-700">
                                {status}
                            </div>
                        )}

                        <Form {...email.form()} className="flex flex-col gap-6">
                            {({ processing, errors }) => (
                                <>
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
                                            autoComplete="off"
                                            autoFocus
                                            placeholder="email@example.com"
                                            className="border-slate-200 bg-slate-50 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="mt-1"
                                        />
                                    </div>

                                    <Button
                                        className="mt-2 w-full rounded-xl bg-slate-900 py-6 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                                        disabled={processing}
                                        data-test="email-password-reset-link-button"
                                    >
                                        {processing && (
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Send Reset Link
                                    </Button>
                                </>
                            )}
                        </Form>

                        <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                            Or, return to{' '}
                            <TextLink
                                href={login()}
                                className="font-bold text-indigo-600 hover:text-indigo-700"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
