import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import SimpleNavbar from '@/components/simple-navbar';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation(); // Inject translator here

    return (
        <>
            <Head title={t('Forgot Password - Soko')} />

            {/* Global Background matching the Auth Flow */}
            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                {/* --- HEADER --- */}
                <SimpleNavbar />

                {/* --- MAIN FORGOT PASSWORD FORM CONTAINER --- */}
                <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-32 pb-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
                                {t('Reset')}{' '}
                                <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    {t('Password')}
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500">
                                {t(
                                    'Enter your email to receive a password reset link',
                                )}
                            </p>
                        </div>

                        {/* Success Status Message */}
                        {status && (
                            <div className="mb-6 rounded-xl border border-purple-100 bg-purple-50 py-3 text-center text-sm font-semibold text-purple-700">
                                {status}
                            </div>
                        )}

                        <Form {...email.form()} className="flex flex-col gap-6">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="email"
                                            className="font-bold text-slate-700"
                                        >
                                            {t('Email address')}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="off"
                                            autoFocus
                                            placeholder={t('email@example.com')}
                                            className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all autofill:shadow-[inset_0_0_0px_1000px_#faf5ff] autofill:[-webkit-text-fill-color:#0f172a] focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="mt-1"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none"
                                        disabled={processing}
                                        data-test="email-password-reset-link-button"
                                    >
                                        {processing ? (
                                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                        ) : null}
                                        {t('Send Reset Link')}
                                    </Button>
                                </>
                            )}
                        </Form>

                        {/* Return to Login Link */}
                        <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm font-medium text-slate-500">
                            {t('Or, return to ')}
                            <TextLink
                                href={login()}
                                className="font-bold text-purple-600 transition-colors hover:text-purple-700"
                            >
                                {t('Log in')}
                            </TextLink>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
