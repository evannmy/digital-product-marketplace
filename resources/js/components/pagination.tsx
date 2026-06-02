import { Link } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Pagination({ links }: { links: any[] }) {
    const { t } = useTranslation();

    if (!links || links.length <= 3) return null;

    const translatePaginationLabel = (
        label: string,
        index: number,
        totalLinks: number,
    ) => {
        if (!label) return '';

        if (index === 0) return `&laquo; ${t('Previous')}`;

        if (index === totalLinks - 1) return `${t('Next')} &raquo;`;

        return label;
    };

    return (
        <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-6 sm:px-8">
            <div className="flex flex-wrap justify-center gap-2">
                {links.map((link: any, index: number) =>
                    link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition-all ${
                                link.active
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-600 ring-1 ring-slate-200/60 hover:bg-slate-50'
                            }`}
                            dangerouslySetInnerHTML={{
                                __html: translatePaginationLabel(
                                    link.label,
                                    index,
                                    links.length,
                                ),
                            }}
                        />
                    ) : (
                        <span
                            key={index}
                            className="flex h-10 min-w-10 cursor-not-allowed items-center justify-center rounded-xl bg-white px-4 text-sm font-bold text-slate-600 opacity-50 ring-1 ring-slate-200/60"
                            dangerouslySetInnerHTML={{
                                __html: translatePaginationLabel(
                                    link.label,
                                    index,
                                    links.length,
                                ),
                            }}
                        />
                    ),
                )}
            </div>
        </div>
    );
}
