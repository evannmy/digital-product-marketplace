import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title="Register - Soko Marketplace" />

            {/* Global Background matching the Welcome & Login Pages */}
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

                {/* Main Register Form Container */}
                <main className="flex flex-1 items-center justify-center px-4 pt-28 pb-12 sm:px-6">
                    <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
                        {/* Header Section with Gradient Typography */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">
                                Create an{' '}
                                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
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
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="name"
                                                className="font-semibold text-slate-700"
                                            >
                                                Full Name
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                placeholder="e.g. John Doe"
                                                className="border-slate-200 bg-slate-50 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
                                            />
                                            <InputError
                                                message={errors.name}
                                                className="mt-1"
                                            />
                                        </div>

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
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                className="border-slate-200 bg-slate-50 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
                                            />
                                            <InputError
                                                message={errors.email}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password"
                                                className="font-semibold text-slate-700"
                                            >
                                                Password
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Create a password"
                                                className="border-slate-200 bg-slate-50 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
                                            />
                                            <InputError
                                                message={errors.password}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="font-semibold text-slate-700"
                                            >
                                                Confirm password
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Confirm password"
                                                className="border-slate-200 bg-slate-50 shadow-sm transition-all focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                                className="mt-1"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-4 w-full rounded-xl bg-slate-900 py-6 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                                            tabIndex={5}
                                            disabled={processing}
                                            data-test="register-user-button"
                                        >
                                            {processing && (
                                                <Spinner className="mr-2" />
                                            )}
                                            Create account
                                        </Button>
                                    </div>

                                    <div className="mt-2 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                                        Already have an account?{' '}
                                        <TextLink
                                            href={login()}
                                            tabIndex={6}
                                            className="font-bold text-indigo-600 hover:text-indigo-700"
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
