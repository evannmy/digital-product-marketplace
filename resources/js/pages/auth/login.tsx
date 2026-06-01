import { Form, Head, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import SimpleNavbar from '@/components/simple-navbar';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/useTranslation';
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
    const { t } = useTranslation(); // Inject translator here

    const { flash } = usePage().props as any;

    return (
        <>
            <Head title={t('Log in - Soko')} />

            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                {/* --- HEADER --- */}
                <SimpleNavbar />

                {/* --- MAIN LOGIN FORM CONTAINER --- */}
                <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-32 pb-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 p-8 shadow-xl ring-1 shadow-purple-900/5 ring-white backdrop-blur-sm sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
                                {t('Log in to your ')}{' '}
                                <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    {t('Account')}
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500">
                                {t(
                                    'Enter your email or username below to log in',
                                )}
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-xl border border-purple-100 bg-purple-50 py-3 text-center text-sm font-semibold text-purple-700">
                                {status}
                            </div>
                        )}

                        {flash?.success && (
                            <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700">
                                {flash.success}
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 p-3 text-center text-sm font-semibold text-rose-600">
                                {flash.error}
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
                                                className="font-bold text-slate-700"
                                            >
                                                {t('Email or Username')}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="text"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="username"
                                                placeholder={t(
                                                    'Enter email or username',
                                                )}
                                                className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label
                                                    htmlFor="password"
                                                    className="font-bold text-slate-700"
                                                >
                                                    {t('Password')}
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700"
                                                        tabIndex={5}
                                                    >
                                                        {t('Forgot password?')}
                                                    </TextLink>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
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
                                                className="h-5 w-5 rounded-md border-slate-300 text-purple-600 shadow-sm transition-all focus:ring-0 focus:outline-none focus-visible:ring-0 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="cursor-pointer text-sm font-medium text-slate-600"
                                            >
                                                {t('Remember me')}
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing ? (
                                                <Spinner className="mr-2 h-5 w-5" />
                                            ) : null}
                                            {t('Log in')}
                                        </Button>
                                    </div>

                                    {canRegister && (
                                        <div className="mt-2 border-t border-slate-100 pt-6 text-center text-sm font-medium text-slate-500">
                                            {t("Don't have an account?")}{' '}
                                            <TextLink
                                                href={register()}
                                                tabIndex={5}
                                                className="font-bold text-purple-600 transition-colors hover:text-purple-700"
                                            >
                                                {t('Sign up')}
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
