import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import SimpleNavbar from '@/components/simple-navbar'; // <-- IMPORT NAVBAR
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Reset Password - Soko" />

            {/* Global Background matching the Auth Flow */}
            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                {/* --- UNIFIED HEADER (With Back Button Hidden) --- */}
                <SimpleNavbar hideBackButton={true} />

                {/* --- MAIN RESET PASSWORD FORM CONTAINER --- */}
                <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-32 pb-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
                                Set New{' '}
                                <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Password
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500">
                                Please enter your new password below
                            </p>
                        </div>

                        <Form
                            {...update.form()}
                            transform={(data) => ({ ...data, token, email })}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <div className="grid gap-6">
                                    {/* Read-Only Email Field */}
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
                                            name="email"
                                            autoComplete="email"
                                            value={email}
                                            readOnly
                                            className="h-12 cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/50 px-4 text-slate-500 shadow-inner focus-visible:ring-0"
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* New Password Input */}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="font-bold text-slate-700"
                                        >
                                            New Password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            autoFocus
                                            placeholder="Enter new password"
                                            className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all autofill:shadow-[inset_0_0_0px_1000px_#faf5ff] autofill:[-webkit-text-fill-color:#0f172a] focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
                                        />
                                        <InputError
                                            message={errors.password}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Confirm New Password Input */}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="font-bold text-slate-700"
                                        >
                                            Confirm New Password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            placeholder="Confirm new password"
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
                                        className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none"
                                        disabled={processing}
                                        data-test="reset-password-button"
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-5 w-5" />
                                        ) : null}
                                        Reset Password
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </div>
                </main>
            </div>
        </>
    );
}
