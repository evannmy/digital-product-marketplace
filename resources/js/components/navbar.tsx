import { Link, usePage, router } from '@inertiajs/react';
import {
    ShoppingCart,
    ChevronDown,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Store,
    TrendingUp,
    Sparkles,
    ShoppingBag,
    LayoutDashboard,
    Users,
    Package,
    Sliders,
    Landmark,
    ClipboardList,
    Wallet,
    Globe, // <-- Globe Icon for Language Menu
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Navbar() {
    const { t } = useTranslation();
    const { url } = usePage();
    const { auth, cartCount } = usePage().props as any;

    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [isLangOpen, setIsLangOpen] = useState(false);
    const langDropdownRef = useRef<HTMLDivElement>(null);

    const [currentLang] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('language');

            if (stored) return stored;

            const browserLang =
                navigator.language || (navigator as any).userLanguage || 'en';

            return browserLang.toLowerCase().startsWith('id') ? 'id' : 'en';
        }

        return 'en';
    });

    useEffect(() => {
        if (!localStorage.getItem('language')) {
            localStorage.setItem('language', currentLang);
        }
    }, [currentLang]);

    const [avatarStatus, setAvatarStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');

    const profileDropdownRef = useRef<HTMLDivElement>(null);

    const changeLanguage = (lang: string) => {
        localStorage.setItem('language', lang);
        router.post(
            `/language/${lang}`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    window.location.reload();
                },
            },
        );
    };

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        router.reload({ only: ['cartCount'] });
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                isProfileOpen &&
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target as Node)
            ) {
                setIsProfileOpen(false);
            }

            if (
                isLangOpen &&
                langDropdownRef.current &&
                !langDropdownRef.current.contains(event.target as Node)
            ) {
                setIsLangOpen(false);
            }
        };

        const handleScrollClose = () => {
            if (isProfileOpen) setIsProfileOpen(false);

            if (isLangOpen) setIsLangOpen(false);
        };

        if (isProfileOpen || isLangOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            window.addEventListener('scroll', handleScrollClose, {
                passive: true,
            });
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('scroll', handleScrollClose);
        };
    }, [isProfileOpen, isLangOpen]);

    const isAdmin = auth?.user?.role === 'admin';
    const isDiscoverActive = url === '/' || url.startsWith('/?');

    return (
        <>
            {/* --- HEADER --- */}
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'border-b border-slate-200/60 bg-white/80 py-3 shadow-sm backdrop-blur-xl'
                        : 'bg-transparent py-5'
                }`}
            >
                <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6 xl:gap-10">
                        {/* 1. Typographic Logo */}
                        <Link
                            href={isAdmin ? '/admin' : '/'}
                            className="group flex items-baseline"
                        >
                            <span className="text-2xl font-black tracking-tighter text-slate-900 transition-colors duration-300 group-hover:text-slate-700 sm:text-3xl">
                                soko{' '}
                                {isAdmin && (
                                    <span className="ml-1 text-sm font-bold tracking-widest text-rose-500 uppercase">
                                        Admin
                                    </span>
                                )}
                            </span>
                            {!isAdmin && (
                                <span className="mb-1 ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-linear-to-tr from-indigo-400 to-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)] sm:mb-1.25 sm:h-2 sm:w-2" />
                            )}
                        </Link>

                        {/* --- DESKTOP NAVIGATION LOGIC --- */}
                        {isAdmin ? (
                            <nav className="hidden items-center gap-1 rounded-full bg-rose-50/50 p-1 ring-1 ring-rose-100 min-[1100px]:flex">
                                <Link
                                    href="/admin"
                                    className={`rounded-full px-5 py-1.5 text-sm transition-all ${
                                        url === '/admin'
                                            ? 'bg-white font-bold text-rose-700 shadow-sm ring-1 ring-rose-200'
                                            : 'font-medium text-slate-500 hover:bg-rose-100/50 hover:text-slate-900'
                                    }`}
                                >
                                    {t('Dashboard')}
                                </Link>
                                <Link
                                    href="/admin/users"
                                    className={`rounded-full px-5 py-1.5 text-sm transition-all ${
                                        url.startsWith('/admin/users')
                                            ? 'bg-white font-bold text-rose-700 shadow-sm ring-1 ring-rose-200'
                                            : 'font-medium text-slate-500 hover:bg-rose-100/50 hover:text-slate-900'
                                    }`}
                                >
                                    {t('Users')}
                                </Link>
                                <Link
                                    href="/admin/products"
                                    className={`rounded-full px-5 py-1.5 text-sm transition-all ${
                                        url.startsWith('/admin/products')
                                            ? 'bg-white font-bold text-rose-700 shadow-sm ring-1 ring-rose-200'
                                            : 'font-medium text-slate-500 hover:bg-rose-100/50 hover:text-slate-900'
                                    }`}
                                >
                                    {t('Products')}
                                </Link>
                                <Link
                                    href="/admin/orders"
                                    className={`rounded-full px-5 py-1.5 text-sm transition-all ${
                                        url.startsWith('/admin/orders')
                                            ? 'bg-white font-bold text-rose-700 shadow-sm ring-1 ring-rose-200'
                                            : 'font-medium text-slate-500 hover:bg-rose-100/50 hover:text-slate-900'
                                    }`}
                                >
                                    {t('Orders')}
                                </Link>
                                <Link
                                    href="/admin/finances"
                                    className={`rounded-full px-5 py-1.5 text-sm transition-all ${
                                        url.startsWith('/admin/finances')
                                            ? 'bg-white font-bold text-rose-700 shadow-sm ring-1 ring-rose-200'
                                            : 'font-medium text-slate-500 hover:bg-rose-100/50 hover:text-slate-900'
                                    }`}
                                >
                                    {t('Finances')}
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    className={`rounded-full px-5 py-1.5 text-sm transition-all ${
                                        url.startsWith('/admin/settings')
                                            ? 'bg-white font-bold text-rose-700 shadow-sm ring-1 ring-rose-200'
                                            : 'font-medium text-slate-500 hover:bg-rose-100/50 hover:text-slate-900'
                                    }`}
                                >
                                    {t('Settings')}
                                </Link>
                            </nav>
                        ) : (
                            /* --- DIBUNGKUS DALAM DIV BARU DENGAN GAP LEBIH KECIL (gap-3) --- */
                            <div
                                className={`hidden items-center gap-3 ${!auth?.user ? 'min-[900px]:flex' : 'md:flex'}`}
                            >
                                {/* A. Menu Navigasi (Pill) */}
                                <nav className="flex items-center gap-1 rounded-full bg-slate-200/50 p-1">
                                    <Link
                                        href="/"
                                        className={`rounded-full px-4 py-1.5 text-sm transition-all xl:px-5 ${
                                            isDiscoverActive
                                                ? 'bg-white font-bold text-purple-700 shadow-sm ring-1 ring-black/5'
                                                : 'font-medium text-slate-500 hover:bg-white/60 hover:text-slate-900'
                                        }`}
                                    >
                                        {t('Discover')}
                                    </Link>

                                    <Link
                                        href="/creators"
                                        className={`rounded-full px-4 py-1.5 text-sm transition-all xl:px-5 ${
                                            url.startsWith('/creators')
                                                ? 'bg-white font-bold text-purple-700 shadow-sm ring-1 ring-black/5'
                                                : 'font-medium text-slate-500 hover:bg-white/60 hover:text-slate-900'
                                        }`}
                                    >
                                        {t('Creators')}
                                    </Link>

                                    {auth?.user && (
                                        <Link
                                            href="/purchases"
                                            className={`rounded-full px-4 py-1.5 text-sm transition-all xl:px-5 ${
                                                url.startsWith('/purchases')
                                                    ? 'bg-white font-bold text-purple-700 shadow-sm ring-1 ring-black/5'
                                                    : 'font-medium text-slate-500 hover:bg-white/60 hover:text-slate-900'
                                            }`}
                                        >
                                            {t('Purchases')}
                                        </Link>
                                    )}
                                </nav>

                                {/* B. Menu Bahasa (Langsung di sebelah kanan Pill) */}
                                {!auth?.user && (
                                    <div
                                        className="relative hidden md:block"
                                        ref={langDropdownRef}
                                    >
                                        <button
                                            onClick={() =>
                                                setIsLangOpen(!isLangOpen)
                                            }
                                            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            <Globe size={18} />
                                            <span className="text-sm uppercase">
                                                {currentLang}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {isLangOpen && (
                                            <div className="absolute top-full left-0 z-50 mt-3 w-40 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 shadow-slate-200/50 ring-black">
                                                <div className="border-b border-slate-50 px-4 py-2">
                                                    <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                                        {t('Language')}
                                                    </p>
                                                </div>
                                                <div className="py-1">
                                                    <button
                                                        onClick={() =>
                                                            changeLanguage('en')
                                                        }
                                                        className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${currentLang === 'en' ? 'bg-slate-50 font-bold text-slate-900' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                                    >
                                                        English
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            changeLanguage('id')
                                                        }
                                                        className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${currentLang === 'id' ? 'bg-slate-50 font-bold text-slate-900' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                                    >
                                                        Indonesia
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div
                        className={`hidden items-center gap-5 ${
                            isAdmin
                                ? 'min-[1100px]:flex'
                                : !auth?.user
                                  ? 'min-[900px]:flex'
                                  : 'md:flex'
                        }`}
                    >
                        {auth?.user &&
                            !isAdmin &&
                            auth.user.role === 'buyer' && (
                                <Link
                                    href={route('creator.onboarding')}
                                    className="hidden items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/50 px-4 py-1.5 text-sm font-bold text-purple-700 transition-all hover:bg-purple-100 hover:shadow-sm min-[1000px]:flex"
                                >
                                    <Sparkles
                                        size={14}
                                        className="text-purple-500"
                                    />
                                    {t('Sell Your Work')}
                                </Link>
                            )}

                        {auth?.user && !isAdmin && (
                            <Link
                                href="/cart"
                                className={`relative transition-colors duration-300 ${
                                    url.startsWith('/cart')
                                        ? 'text-purple-700'
                                        : 'text-slate-500 hover:text-purple-600'
                                }`}
                            >
                                <ShoppingCart
                                    size={22}
                                    className={
                                        url.startsWith('/cart')
                                            ? 'fill-purple-50'
                                            : ''
                                    }
                                />
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {cartCount || 0}
                                </span>
                            </Link>
                        )}

                        {auth?.user && (
                            <div className="h-6 w-px bg-slate-200"></div>
                        )}

                        {auth?.user ? (
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={() =>
                                        setIsProfileOpen(!isProfileOpen)
                                    }
                                    className="flex cursor-pointer items-center gap-3 rounded-full py-1 pr-3 pl-1 transition-all hover:bg-slate-100 focus:outline-none"
                                >
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ring-1 ${isAdmin ? 'bg-rose-100 text-rose-700 ring-rose-200' : 'bg-purple-100 text-purple-700 ring-purple-200'}`}
                                    >
                                        {/* --- SMART AVATAR RENDER (DESKTOP) --- */}
                                        {auth.user.avatar_path &&
                                        avatarStatus !== 'error' ? (
                                            <img
                                                src={
                                                    auth.user.avatar_path.startsWith(
                                                        'http',
                                                    )
                                                        ? auth.user.avatar_path
                                                        : `/storage/${auth.user.avatar_path}`
                                                }
                                                alt={auth.user.name}
                                                className={`h-full w-full object-cover transition-opacity duration-300 ${avatarStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                                onLoad={() =>
                                                    setAvatarStatus('loaded')
                                                }
                                                onError={() =>
                                                    setAvatarStatus('error')
                                                }
                                            />
                                        ) : (
                                            auth.user.name
                                                .charAt(0)
                                                .toUpperCase()
                                        )}
                                    </div>
                                    <span className="max-w-30 truncate text-sm font-medium text-slate-700 lg:max-w-50">
                                        {auth.user.name}
                                    </span>
                                    <ChevronDown
                                        size={14}
                                        className={`shrink-0 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isProfileOpen && (
                                    <div className="ring-opacity-5 absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 shadow-slate-200/50 ring-black">
                                        <div className="border-b border-slate-50 px-4 py-3">
                                            <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
                                                {isAdmin
                                                    ? t('Administrator')
                                                    : t('Account')}
                                            </p>
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                        <div className="py-1">
                                            {!isAdmin && (
                                                <Link
                                                    href={route('profile.edit')}
                                                    onClick={() =>
                                                        setIsProfileOpen(false)
                                                    }
                                                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${url.startsWith('/profile') ? 'bg-purple-50 font-bold text-purple-700' : 'font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700'}`}
                                                >
                                                    <User
                                                        size={16}
                                                        className={`mr-3 ${url.startsWith('/profile') ? 'text-purple-500' : 'text-slate-400'}`}
                                                    />
                                                    {t('My Profile')}
                                                </Link>
                                            )}

                                            <Link
                                                href={route('settings.index')}
                                                onClick={() =>
                                                    setIsProfileOpen(false)
                                                }
                                                className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${url.startsWith('/settings') ? (isAdmin ? 'bg-rose-50 font-bold text-rose-700' : 'bg-purple-50 font-bold text-purple-700') : isAdmin ? 'font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700' : 'font-medium text-slate-600 hover:bg-purple-50 hover:text-purple-700'}`}
                                            >
                                                <Settings
                                                    size={16}
                                                    className={`mr-3 ${url.startsWith('/settings') ? (isAdmin ? 'text-rose-500' : 'text-purple-500') : 'text-slate-400'}`}
                                                />
                                                {t('Account Settings')}
                                            </Link>

                                            {!isAdmin &&
                                                auth.user.role === 'buyer' && (
                                                    <>
                                                        <div className="my-1 border-t border-slate-50 min-[900px]:hidden"></div>
                                                        <Link
                                                            href={route(
                                                                'creator.onboarding',
                                                            )}
                                                            onClick={() =>
                                                                setIsProfileOpen(
                                                                    false,
                                                                )
                                                            }
                                                            className="flex w-full items-center px-4 py-2 text-sm font-bold text-purple-600 transition-colors hover:bg-purple-50 hover:text-purple-700 min-[1000px]:hidden"
                                                        >
                                                            <Sparkles
                                                                size={16}
                                                                className="mr-3 text-purple-400"
                                                            />
                                                            {t(
                                                                'Sell Your Work',
                                                            )}
                                                        </Link>
                                                    </>
                                                )}

                                            {!isAdmin &&
                                                auth.user.role === 'seller' && (
                                                    <>
                                                        <div className="my-1 border-t border-slate-50"></div>
                                                        <p className="px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                            {t('Seller Hub')}
                                                        </p>
                                                        <Link
                                                            href={route(
                                                                'products.mine',
                                                            )}
                                                            onClick={() =>
                                                                setIsProfileOpen(
                                                                    false,
                                                                )
                                                            }
                                                            className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${route().current('products.mine') ? 'bg-emerald-50 font-bold text-emerald-700' : 'font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                        >
                                                            <Store
                                                                size={16}
                                                                className={`mr-3 ${route().current('products.mine') ? 'text-emerald-500' : 'text-slate-400'}`}
                                                            />
                                                            {t(
                                                                'Manage Products',
                                                            )}
                                                        </Link>

                                                        <Link
                                                            href={route(
                                                                'promotions.index',
                                                            )}
                                                            onClick={() =>
                                                                setIsProfileOpen(
                                                                    false,
                                                                )
                                                            }
                                                            className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${route().current('promotions.index') ? 'bg-emerald-50 font-bold text-emerald-700' : 'font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                        >
                                                            <TrendingUp
                                                                size={16}
                                                                className={`mr-3 ${route().current('promotions.index') ? 'text-emerald-500' : 'text-slate-400'}`}
                                                            />
                                                            {t('Promotions')}
                                                        </Link>

                                                        <Link
                                                            href="/seller/orders"
                                                            onClick={() =>
                                                                setIsProfileOpen(
                                                                    false,
                                                                )
                                                            }
                                                            className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${url.startsWith('/seller/orders') ? 'bg-emerald-50 font-bold text-emerald-700' : 'font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                        >
                                                            <ClipboardList
                                                                size={16}
                                                                className={`mr-3 ${url.startsWith('/seller/orders') ? 'text-emerald-500' : 'text-slate-400'}`}
                                                            />
                                                            {t('Sales History')}
                                                        </Link>

                                                        <Link
                                                            href="/seller/earnings"
                                                            onClick={() =>
                                                                setIsProfileOpen(
                                                                    false,
                                                                )
                                                            }
                                                            className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${url.startsWith('/seller/earnings') ? 'bg-emerald-50 font-bold text-emerald-700' : 'font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                        >
                                                            <Wallet
                                                                size={16}
                                                                className={`mr-3 ${url.startsWith('/seller/earnings') ? 'text-emerald-500' : 'text-slate-400'}`}
                                                            />
                                                            {t('My Earnings')}
                                                        </Link>
                                                    </>
                                                )}
                                        </div>
                                        {/* --- ADDED: LANGUAGE SELECTOR IN PROFILE DROPDOWN --- */}
                                        <div className="border-t border-slate-50 py-2">
                                            <p className="px-4 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {t('Language')}
                                            </p>
                                            <div className="flex gap-2 px-4">
                                                <button
                                                    onClick={() => {
                                                        changeLanguage('en');
                                                        setIsProfileOpen(false); // Tutup popup setelah diklik
                                                    }}
                                                    className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${currentLang === 'en' ? 'bg-slate-900 font-bold text-white' : 'bg-slate-100 font-medium text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    English
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        changeLanguage('id');
                                                        setIsProfileOpen(false); // Tutup popup setelah diklik
                                                    }}
                                                    className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${currentLang === 'id' ? 'bg-slate-900 font-bold text-white' : 'bg-slate-100 font-medium text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    Indonesia
                                                </button>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-50 py-1">
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center px-4 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <LogOut
                                                    size={16}
                                                    className="mr-3 text-slate-400"
                                                />{' '}
                                                {t('Log Out')}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href={route('creator.onboarding')}
                                    className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/50 px-4 py-1.5 text-sm font-bold text-purple-700 transition-all hover:bg-purple-100 hover:shadow-sm"
                                >
                                    <Sparkles
                                        size={14}
                                        className="text-purple-500"
                                    />
                                    {t('Sell Your Work')}
                                </Link>

                                {/* Garis vertikal pembatas agar UI rapi */}
                                <div className="block h-5 w-px bg-slate-200"></div>
                                {/* ---------------------------------------------------------------- */}

                                <Link
                                    href={route('login')}
                                    className="text-sm font-bold text-slate-600 hover:text-purple-600"
                                >
                                    {t('Log in')}
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
                                >
                                    {t('Get Started')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Right Actions */}
                    <div
                        className={`flex items-center gap-2 ${
                            isAdmin
                                ? 'min-[1100px]:hidden'
                                : !auth?.user
                                  ? 'min-[900px]:hidden'
                                  : 'md:hidden'
                        }`}
                    >
                        {auth?.user && !isAdmin && (
                            <Link
                                href="/cart"
                                className={`relative p-2 transition-colors duration-300 ${url.startsWith('/cart') ? 'text-purple-700' : 'text-slate-600 hover:text-purple-600'}`}
                            >
                                <ShoppingCart
                                    size={24}
                                    className={
                                        url.startsWith('/cart')
                                            ? 'fill-purple-50'
                                            : ''
                                    }
                                />
                                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {cartCount || 0}
                                </span>
                            </Link>
                        )}

                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="p-2 text-slate-900"
                        >
                            {isMobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MOBILE MENU --- */}
            {isMobileMenuOpen && (
                <div
                    className={`fixed inset-x-0 top-18 z-40 border-b border-slate-200 bg-white shadow-xl ${
                        isAdmin
                            ? 'min-[1100px]:hidden'
                            : !auth?.user
                              ? 'min-[900px]:hidden'
                              : 'md:hidden'
                    }`}
                >
                    <div className="max-h-[calc(100vh-72px)] overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent">
                        <nav className="flex flex-col gap-2">
                            {/* --- MOBILE NAVIGATION LOGIC --- */}
                            {isAdmin ? (
                                <>
                                    <Link
                                        href="/admin"
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${url === '/admin' ? 'bg-rose-50 font-bold text-rose-700' : 'font-medium text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <LayoutDashboard
                                                size={18}
                                                className="mr-4 text-slate-400"
                                            />{' '}
                                            {t('Dashboard')}
                                        </div>
                                    </Link>
                                    <Link
                                        href="/admin/users"
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${url.startsWith('/admin/users') ? 'bg-rose-50 font-bold text-rose-700' : 'font-medium text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <Users
                                                size={18}
                                                className="mr-4 text-slate-400"
                                            />{' '}
                                            {t('Manage Users')}
                                        </div>
                                    </Link>
                                    <Link
                                        href="/admin/products"
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${url.startsWith('/admin/products') ? 'bg-rose-50 font-bold text-rose-700' : 'font-medium text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <Package
                                                size={18}
                                                className="mr-4 text-slate-400"
                                            />{' '}
                                            {t('Manage Products')}
                                        </div>
                                    </Link>
                                    <Link
                                        href="/admin/orders"
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${url.startsWith('/admin/orders') ? 'bg-rose-50 font-bold text-rose-700' : 'font-medium text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <ClipboardList
                                                size={18}
                                                className="mr-4 text-slate-400"
                                            />{' '}
                                            {t('Order Verifications')}
                                        </div>
                                    </Link>
                                    <Link
                                        href="/admin/finances"
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${url.startsWith('/admin/finances') ? 'bg-rose-50 font-bold text-rose-700' : 'font-medium text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <Landmark
                                                size={18}
                                                className="mr-4 text-slate-400"
                                            />{' '}
                                            {t('Platform Finances')}
                                        </div>
                                    </Link>
                                    <Link
                                        href="/admin/settings"
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${url.startsWith('/admin/settings') ? 'bg-rose-50 font-bold text-rose-700' : 'font-medium text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <Sliders
                                                size={18}
                                                className="mr-4 text-slate-400"
                                            />{' '}
                                            {t('Platform Settings')}
                                        </div>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/"
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${isDiscoverActive ? 'bg-purple-50 font-bold text-purple-700' : 'font-medium text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {t('Discover')}
                                        {isDiscoverActive && (
                                            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/creators"
                                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${url.startsWith('/creators') ? 'bg-purple-50 font-bold text-purple-700' : 'font-medium text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {t('Creators')}
                                        {url.startsWith('/creators') && (
                                            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                        )}
                                    </Link>
                                    <div className="mt-3 mb-2 px-2">
                                        <Link
                                            href={route('creator.onboarding')}
                                            className="flex w-full items-center justify-center rounded-xl border border-purple-100 bg-purple-50 px-3 py-3.5 text-base font-bold text-purple-700 transition-colors hover:bg-purple-100"
                                        >
                                            <Sparkles
                                                size={18}
                                                className="mr-2 text-purple-500"
                                            />{' '}
                                            {t('Sell Your Work')}
                                        </Link>
                                    </div>
                                </>
                            )}

                            {/* --- MOBILE USER SECTION --- */}
                            {auth?.user ? (
                                <>
                                    <hr className="my-3 border-slate-100" />
                                    <div className="mb-3 flex items-center px-4 py-2">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-bold shadow-sm ring-2 ring-white ${isAdmin ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'}`}
                                        >
                                            {/* --- SMART AVATAR RENDER (MOBILE) --- */}
                                            {auth.user.avatar_path &&
                                            avatarStatus !== 'error' ? (
                                                <img
                                                    src={
                                                        auth.user.avatar_path.startsWith(
                                                            'http',
                                                        )
                                                            ? auth.user
                                                                  .avatar_path
                                                            : `/storage/${auth.user.avatar_path}`
                                                    }
                                                    alt={auth.user.name}
                                                    className={`h-full w-full object-cover transition-opacity duration-300 ${avatarStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                                    onLoad={() =>
                                                        setAvatarStatus(
                                                            'loaded',
                                                        )
                                                    }
                                                    onError={() =>
                                                        setAvatarStatus('error')
                                                    }
                                                />
                                            ) : (
                                                auth.user.name
                                                    .charAt(0)
                                                    .toUpperCase()
                                            )}
                                        </div>
                                        <div className="ml-4 flex min-w-0 flex-col overflow-hidden">
                                            <div className="flex items-center gap-2 font-bold text-slate-900">
                                                <span className="truncate text-base">
                                                    {auth.user.name}
                                                </span>
                                                {isAdmin && (
                                                    <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] tracking-wider text-rose-600 uppercase">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <div className="truncate text-sm font-medium text-slate-500">
                                                {auth.user.email}
                                            </div>
                                        </div>
                                    </div>

                                    {!isAdmin && (
                                        <Link
                                            href={route('profile.edit')}
                                            className={`flex items-center rounded-xl px-4 py-3 text-base transition-colors ${url.startsWith('/profile') ? 'bg-purple-50 font-bold text-purple-700' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                        >
                                            <User
                                                size={18}
                                                className={`mr-4 ${url.startsWith('/profile') ? 'text-purple-500' : 'text-slate-400'}`}
                                            />{' '}
                                            {t('My Profile')}
                                        </Link>
                                    )}

                                    <Link
                                        href={route('settings.index')}
                                        className={`flex items-center rounded-xl px-4 py-3 text-base transition-colors ${url.startsWith('/settings') ? (isAdmin ? 'bg-rose-50 font-bold text-rose-700' : 'bg-purple-50 font-bold text-purple-700') : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        <Settings
                                            size={18}
                                            className={`mr-4 ${url.startsWith('/settings') ? (isAdmin ? 'text-rose-500' : 'text-purple-500') : 'text-slate-400'}`}
                                        />{' '}
                                        {t('Account Settings')}
                                    </Link>

                                    {!isAdmin && (
                                        <>
                                            <Link
                                                href="/purchases"
                                                className={`flex items-center rounded-xl px-4 py-3 text-base transition-colors ${url.startsWith('/purchases') ? 'bg-purple-50 font-bold text-purple-700' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                            >
                                                <ShoppingBag
                                                    size={18}
                                                    className={`mr-4 ${url.startsWith('/purchases') ? 'text-purple-500' : 'text-slate-400'}`}
                                                />{' '}
                                                {t('My Purchases')}
                                            </Link>
                                            <Link
                                                href="/cart"
                                                className={`flex items-center justify-between rounded-xl px-4 py-3 text-base transition-colors ${url.startsWith('/cart') ? 'bg-purple-50 font-bold text-purple-700' : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                            >
                                                <div className="flex items-center">
                                                    <ShoppingCart
                                                        size={18}
                                                        className={`mr-4 ${url.startsWith('/cart') ? 'text-purple-500' : 'text-slate-400'}`}
                                                    />{' '}
                                                    {t('My Cart')}
                                                </div>
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                                                    {cartCount || 0}
                                                </span>
                                            </Link>
                                        </>
                                    )}

                                    {!isAdmin &&
                                        auth.user.role === 'seller' && (
                                            <div className="mt-3 mb-2 rounded-2xl border border-emerald-100/50 bg-emerald-50/50 p-2">
                                                <p className="px-3 py-2 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                                    {t('Seller Hub')}
                                                </p>
                                                <Link
                                                    href={route(
                                                        'products.mine',
                                                    )}
                                                    className={`flex items-center rounded-xl px-3 py-3 text-base transition-colors ${route().current('products.mine') ? 'bg-emerald-100 font-bold text-emerald-800' : 'font-medium text-emerald-700 hover:bg-emerald-100/50'}`}
                                                >
                                                    <Store
                                                        size={18}
                                                        className={`mr-4 ${route().current('products.mine') ? 'text-emerald-600' : 'text-emerald-500'}`}
                                                    />{' '}
                                                    {t('Manage Products')}
                                                </Link>

                                                <Link
                                                    href={route(
                                                        'promotions.index',
                                                    )}
                                                    className={`flex items-center rounded-xl px-3 py-3 text-base transition-colors ${route().current('promotions.index') ? 'bg-emerald-100 font-bold text-emerald-800' : 'font-medium text-emerald-700 hover:bg-emerald-100/50'}`}
                                                >
                                                    <TrendingUp
                                                        size={18}
                                                        className={`mr-4 ${route().current('promotions.index') ? 'text-emerald-600' : 'text-emerald-500'}`}
                                                    />{' '}
                                                    {t('Promotions')}
                                                </Link>

                                                <Link
                                                    href="/seller/orders"
                                                    className={`flex items-center rounded-xl px-3 py-3 text-base transition-colors ${url.startsWith('/seller/orders') ? 'bg-emerald-100 font-bold text-emerald-800' : 'font-medium text-emerald-700 hover:bg-emerald-100/50'}`}
                                                >
                                                    <ClipboardList
                                                        size={18}
                                                        className={`mr-4 ${url.startsWith('/seller/orders') ? 'text-emerald-600' : 'text-emerald-500'}`}
                                                    />{' '}
                                                    {t('Sales History')}
                                                </Link>

                                                <Link
                                                    href="/seller/earnings"
                                                    className={`flex items-center rounded-xl px-3 py-3 text-base transition-colors ${url.startsWith('/seller/earnings') ? 'bg-emerald-100 font-bold text-emerald-800' : 'font-medium text-emerald-700 hover:bg-emerald-100/50'}`}
                                                >
                                                    <Wallet
                                                        size={18}
                                                        className={`mr-4 ${url.startsWith('/seller/earnings') ? 'text-emerald-600' : 'text-emerald-500'}`}
                                                    />{' '}
                                                    {t('My Earnings')}
                                                </Link>
                                            </div>
                                        )}

                                    {/* --- ADDED: MOBILE LANGUAGE SWITCHER --- */}
                                    <hr className="my-3 border-slate-100" />
                                    <div className="px-2 pb-2">
                                        <p className="px-2 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            {t('Language')}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    changeLanguage('en')
                                                }
                                                className={`flex-1 rounded-xl px-3 py-2.5 text-sm transition-colors ${currentLang === 'en' ? 'bg-slate-900 font-bold text-white' : 'bg-slate-100 font-medium text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                English
                                            </button>
                                            <button
                                                onClick={() =>
                                                    changeLanguage('id')
                                                }
                                                className={`flex-1 rounded-xl px-3 py-2.5 text-sm transition-colors ${currentLang === 'id' ? 'bg-slate-900 font-bold text-white' : 'bg-slate-100 font-medium text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                Indonesia
                                            </button>
                                        </div>
                                    </div>

                                    <hr className="my-3 border-slate-100" />
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium text-rose-600 hover:bg-rose-50"
                                    >
                                        <LogOut
                                            size={18}
                                            className="mr-4 text-rose-400"
                                        />{' '}
                                        {t('Log Out')}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <hr className="my-4 border-slate-100" />

                                    {/* --- ADDED: MOBILE LANGUAGE SWITCHER FOR GUESTS --- */}
                                    <div className="px-2 pb-4">
                                        <p className="px-2 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            {t('Language')}
                                        </p>
                                        <div className="flex rounded-lg bg-slate-100/80 p-1">
                                            <button
                                                onClick={() =>
                                                    changeLanguage('en')
                                                }
                                                className={`flex-1 rounded-md py-1.5 text-xs transition-all ${
                                                    currentLang === 'en'
                                                        ? 'bg-white font-bold text-slate-900 shadow-sm ring-1 ring-black/5'
                                                        : 'font-medium text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                English
                                            </button>
                                            <button
                                                onClick={() =>
                                                    changeLanguage('id')
                                                }
                                                className={`flex-1 rounded-md py-1.5 text-xs transition-all ${
                                                    currentLang === 'id'
                                                        ? 'bg-white font-bold text-slate-900 shadow-sm ring-1 ring-black/5'
                                                        : 'font-medium text-slate-500 hover:text-slate-700'
                                                }`}
                                            >
                                                Indonesia
                                            </button>
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <hr className="mt-1 mb-4 border-slate-100" />

                                    <Link
                                        href={route('login')}
                                        className="flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-3.5 text-base font-bold text-slate-900 transition-colors hover:bg-slate-200"
                                    >
                                        {t('Log in')}
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="mt-2 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800"
                                    >
                                        {t('Get Started')}
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
