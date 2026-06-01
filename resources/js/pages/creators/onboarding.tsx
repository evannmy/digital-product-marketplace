import { Head, useForm } from '@inertiajs/react';
import { Shield, Wallet, Sparkles, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import SimpleNavbar from '@/components/simple-navbar';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

export default function Onboarding({ settings = {} }: any) {
    const { t } = useTranslation(); // Inject translator here
    const { post, processing } = useForm();
    const [agreed, setAgreed] = useState(false);

    // --- DYNAMIC SETTINGS ---
    const platformFee = Number(settings.platform_fee_percentage || 5);
    const creatorKeep = 100 - platformFee;
    const withdrawalMin = settings.withdrawal_minimum || 20000;
    const withdrawalFree = settings.withdrawal_free_threshold || 500000;

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (agreed) {
            post(route('creator.store'));
        }
    };

    return (
        <>
            <Head title={t('Become a Creator - Soko')} />

            <div className="relative flex min-h-screen flex-col bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
                <SimpleNavbar />

                <main className="relative z-10 flex-1 px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        {/* Header Section */}
                        <div className="mb-12 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 ring-8 ring-purple-50/50">
                                <Sparkles className="h-10 w-10 text-purple-600" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                                {t('Turn your passion into profit')}
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                                {t(
                                    'Join hundreds of creators selling premium digital assets, templates, and tools to a global audience.',
                                )}
                            </p>
                        </div>

                        {/* --- DYNAMIC BENEFITS GRID --- */}
                        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                                <CheckCircle className="mb-4 h-8 w-8 text-indigo-500" />
                                <h3 className="mb-2 font-bold text-slate-900">
                                    {t('Low')} {platformFee}% {t('Fee')}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {t('Keep')} {creatorKeep}
                                    {t(
                                        '% of every sale you make. We only take a minimal',
                                    )}{' '}
                                    {platformFee}
                                    {t(
                                        '% platform cut to keep the servers running smoothly.',
                                    )}
                                </p>
                            </div>
                            <div className="rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                                <Wallet className="mb-4 h-8 w-8 text-emerald-500" />
                                <h3 className="mb-2 font-bold text-slate-900">
                                    {t('Flexible Payouts')}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {t('Withdraw anytime starting at')}{' '}
                                    {formatCurrency(withdrawalMin)}
                                    {t('. Plus, all payouts over')}{' '}
                                    {formatCurrency(withdrawalFree)}{' '}
                                    {t('are completely free of transfer fees!')}
                                </p>
                            </div>
                            <div className="rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                                <Shield className="mb-4 h-8 w-8 text-amber-500" />
                                <h3 className="mb-2 font-bold text-slate-900">
                                    {t('Secure Hosting')}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {t(
                                        'We securely host your deliverables (up to 50MB) and automatically manage secure downloads for your buyers.',
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Agreement & Submission Form */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/95 shadow-xl shadow-purple-900/5 backdrop-blur-sm">
                            <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                                <h2 className="text-xl font-black text-slate-900">
                                    {t('Creator Terms & Conditions')}
                                </h2>
                            </div>

                            <div className="p-8">
                                <ul className="mb-8 space-y-4 text-sm text-slate-600">
                                    <li className="flex gap-3">
                                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                                        <p>
                                            {t(
                                                'You guarantee that you own the rights to all intellectual property you upload to the Soko platform.',
                                            )}
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                                        <p>
                                            {t(
                                                'Products must not contain malicious code, viruses, or explicit material.',
                                            )}
                                        </p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                                        <p>
                                            {t(
                                                'You agree to provide basic support to customers who purchase your products.',
                                            )}
                                        </p>
                                    </li>
                                </ul>

                                <form onSubmit={submit}>
                                    <label className="group mb-8 flex cursor-pointer items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300">
                                        <div className="relative flex h-6 items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={agreed}
                                                onChange={(e) =>
                                                    setAgreed(e.target.checked)
                                                }
                                            />
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 bg-white transition group-hover:border-purple-400 peer-checked:border-purple-600 peer-checked:bg-purple-600">
                                                <svg
                                                    className={`h-3.5 w-3.5 text-white transition-transform duration-200 ${agreed ? 'scale-100' : 'scale-0'}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="3"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        <p className="text-sm leading-relaxed text-slate-700">
                                            {t('I have read and agree to the')}{' '}
                                            <strong className="font-bold text-slate-900">
                                                {t(
                                                    'Creator Terms & Conditions',
                                                )}
                                            </strong>
                                            {t(
                                                ', and I am ready to start selling.',
                                            )}
                                        </p>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!agreed || processing}
                                        className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                    >
                                        {processing
                                            ? t(
                                                  'Setting up your Creator Hub...',
                                              )
                                            : t('Accept & Become a Creator')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
