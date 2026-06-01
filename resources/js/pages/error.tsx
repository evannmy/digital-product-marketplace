import { Head, Link } from '@inertiajs/react';
import {
    Home,
    FileQuestion,
    AlertTriangle,
    ShieldAlert,
    ServerCrash,
} from 'lucide-react';
import Navbar from '@/components/navbar';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

export default function ErrorPage({ status }: { status: number }) {
    // Inject translator here
    const { t } = useTranslation();

    // Map the status code to a user-friendly title
    const title =
        {
            503: t('Service Unavailable'),
            500: t('Server Error'),
            404: t('Page Not Found'),
            403: t('Forbidden Access'),
        }[status] || t('An Error Occurred');

    // Map the status code to a helpful description
    const description =
        {
            503: t(
                'Sorry, we are doing some maintenance. Please check back soon.',
            ),
            500: t(
                'Whoops, something went wrong on our servers. We are looking into it.',
            ),
            404: t(
                'Sorry, the page or product you are looking for could not be found.',
            ),
            403: t('Sorry, you do not have permission to access this page.'),
        }[status] || t('An unexpected error occurred.');

    // Choose an icon based on the error type
    const ErrorIcon =
        {
            503: ServerCrash,
            500: AlertTriangle,
            404: FileQuestion,
            403: ShieldAlert,
        }[status] || AlertTriangle;

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-purple-200 selection:text-purple-900">
            <Head title={`${title} - Soko`} />
            <Navbar />

            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-sm ring-4 ring-white">
                    <ErrorIcon size={48} />
                </div>

                <h1 className="mb-2 text-6xl font-black tracking-tight text-slate-900 sm:text-7xl lg:text-8xl">
                    {status}
                </h1>

                <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                    {title}
                </h2>

                <p className="mb-10 max-w-md text-lg text-slate-500">
                    {description}
                </p>

                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                >
                    <Home size={20} />
                    {t('Back to Homepage')}
                </Link>
            </main>
        </div>
    );
}
