import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    User,
    AtSign,
    Link as LinkIcon,
    Camera,
    Save,
    Github,
    Instagram,
    Globe,
    Trash2,
    Image as ImageIcon,
    CheckCircle2,
    XCircle,
    PackageX,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';
// --- ADDED: Translation Hook ---
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfileEdit({ auth, user_data }: any) {
    const { t } = useTranslation(); // Inject translator here
    const activeUser = user_data || auth.user;

    // --- ADDED: Ambil flash dari Inertia ---
    const { flash } = usePage().props as any;

    // --- ADDED: Listener otomatis untuk Toast ---
    useEffect(() => {
        if (flash?.success) toast(flash.success, 'success');

        if (flash?.error) toast(flash.error, 'error');
    }, [flash]);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'patch',
        name: activeUser.name || '',
        username: activeUser.username || '',
        bio: activeUser.bio || '',
        website: activeUser.website || '',
        instagram: activeUser.instagram || '',
        github: activeUser.github || '',
        cover_photo: null as File | null,
        avatar: null as File | null,
        remove_cover_photo: false,
        remove_avatar: false,
    });

    const [usernameStatus, setUsernameStatus] = useState<
        'idle' | 'checking' | 'available' | 'taken'
    >('idle');

    const [coverStatus, setCoverStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');
    const [avatarStatus, setAvatarStatus] = useState<
        'loading' | 'loaded' | 'error'
    >('loading');

    useEffect(() => {
        let isMounted = true;

        if (
            !data.username ||
            data.username.length < 3 ||
            data.username === activeUser.username
        ) {
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            if (isMounted) setUsernameStatus('checking');

            try {
                const response = await axios.post('/check-username', {
                    username: data.username,
                });

                if (isMounted) {
                    setUsernameStatus(
                        response.data.available ? 'available' : 'taken',
                    );
                }
            } catch {
                if (isMounted) setUsernameStatus('idle');
            }
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(delayDebounceFn);
        };
    }, [data.username, activeUser.username]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (usernameStatus === 'taken') {
            toast(
                t('Please choose an available username before saving.'),
                'error',
            );

            return;
        }

        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {},
            onError: () => toast(t('Failed to update profile.'), 'error'),
        });
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'avatar' | 'cover_photo',
    ) => {
        const file = e.target.files ? e.target.files[0] : null;

        if (file) {
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (file.size > maxSize) {
                toast(
                    t(
                        'Whoops! That image is too large. Please select a file under 5MB.',
                    ),
                    'error',
                );
                e.target.value = '';

                return;
            }
        }

        setData((prev) => ({
            ...prev,
            [field]: file,
            [`remove_${field}`]: false,
        }));

        if (field === 'cover_photo') setCoverStatus('loading');

        if (field === 'avatar') setAvatarStatus('loading');
    };

    const coverPreviewUrl = data.cover_photo
        ? URL.createObjectURL(data.cover_photo)
        : null;
    const existingCoverUrl = activeUser.cover_photo_path
        ? `/storage/${activeUser.cover_photo_path}`
        : null;
    const displayCover = !data.remove_cover_photo
        ? coverPreviewUrl || existingCoverUrl
        : null;

    const avatarPreviewUrl = data.avatar
        ? URL.createObjectURL(data.avatar)
        : null;
    const existingAvatarUrl = activeUser.avatar_path
        ? `/storage/${activeUser.avatar_path}`
        : null;
    const displayAvatar = !data.remove_avatar
        ? avatarPreviewUrl || existingAvatarUrl
        : null;

    const removeCover = () => {
        setData((prev) => ({
            ...prev,
            cover_photo: null,
            remove_cover_photo: true,
        }));
        setCoverStatus('loading');
    };

    const removeAvatar = () => {
        setData((prev) => ({ ...prev, avatar: null, remove_avatar: true }));
        setAvatarStatus('loading');
    };

    const handleCoverLoad = () => {
        setTimeout(() => setCoverStatus('loaded'), 0);
    };

    const handleCoverError = () => {
        setTimeout(() => setCoverStatus('error'), 0);
    };

    const handleAvatarLoad = () => {
        setTimeout(() => setAvatarStatus('loaded'), 0);
    };

    const handleAvatarError = () => {
        setTimeout(() => setAvatarStatus('error'), 0);
    };

    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900">
            <Head title={t('My Profile - Soko')} />
            <Navbar />

            <main className="relative z-10 flex-1 pt-32 pb-24">
                <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            {t('My Profile')}
                        </h1>
                        <p className="mt-2 text-lg text-slate-500">
                            {t(
                                'Customize your profile and build your creator brand.',
                            )}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5">
                        <form onSubmit={submit} className="p-6 sm:p-10">
                            {/* --- STOREFRONT BANNER SECTION --- */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h4 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-400 uppercase">
                                        <ImageIcon size={16} />{' '}
                                        {t('Storefront Banner')}
                                    </h4>
                                    {displayCover && (
                                        <button
                                            type="button"
                                            onClick={removeCover}
                                            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600"
                                        >
                                            <Trash2 size={14} />{' '}
                                            {t('Remove Banner')}
                                        </button>
                                    )}
                                </div>

                                <div className="group relative mt-4 flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-purple-400 hover:bg-purple-50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(e, 'cover_photo')
                                        }
                                        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                                    />

                                    {/* --- SMART BANNER RENDER --- */}
                                    {displayCover ? (
                                        <>
                                            {coverStatus === 'error' ? (
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <PackageX className="mb-2 h-8 w-8 opacity-50" />
                                                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                                                        {t('Banner Missing')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={displayCover}
                                                    alt="Cover Preview"
                                                    className={`h-full w-full object-cover transition-opacity duration-300 ${coverStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                                    onLoad={handleCoverLoad}
                                                    onError={handleCoverError}
                                                />
                                            )}
                                            <div className="pointer-events-none absolute right-3 bottom-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/60 text-white/90 shadow-sm backdrop-blur-md transition-colors group-hover:bg-slate-900/80 sm:right-4 sm:bottom-4 sm:h-10 sm:w-10">
                                                <Camera size={18} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-500">
                                            <ImageIcon className="mb-2 h-8 w-8 text-slate-400" />
                                            <p className="text-sm font-bold text-slate-700">
                                                {t(
                                                    'Click to upload cover photo',
                                                )}
                                            </p>
                                            <p className="text-xs">
                                                {t(
                                                    'PNG, JPG, or WEBP (Max 5MB)',
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {errors.cover_photo && (
                                    <p className="mt-2 text-sm text-rose-500">
                                        {errors.cover_photo}
                                    </p>
                                )}
                            </div>

                            {/* --- PROFILE PICTURE SECTION --- */}
                            <div className="mb-10 flex items-center gap-6">
                                <div className="group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-purple-100 text-3xl font-black text-purple-700 shadow-lg ring-4 ring-white transition-all hover:ring-purple-200">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(e, 'avatar')
                                        }
                                        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                                        title="Change Profile Picture"
                                    />

                                    {/* --- SMART AVATAR RENDER --- */}
                                    {displayAvatar ? (
                                        avatarStatus === 'error' ? (
                                            <span className="text-slate-400">
                                                <User
                                                    size={40}
                                                    className="opacity-30"
                                                />
                                            </span>
                                        ) : (
                                            <img
                                                src={displayAvatar}
                                                alt="Avatar Preview"
                                                className={`h-full w-full object-cover transition-opacity duration-300 ${avatarStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                                                onLoad={handleAvatarLoad}
                                                onError={handleAvatarError}
                                            />
                                        )
                                    ) : (
                                        <span>
                                            {data.name.charAt(0) ||
                                                activeUser.name.charAt(0)}
                                        </span>
                                    )}

                                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent pb-2.5 transition-opacity group-hover:opacity-90 sm:pb-3">
                                        <Camera
                                            size={18}
                                            className="text-white/90"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-start">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {t('Profile Picture')}
                                    </h3>
                                    <p className="mb-2 text-sm text-slate-500">
                                        {t(
                                            'Click the circle to upload a JPG, GIF or PNG. Max size 5MB.',
                                        )}
                                    </p>
                                    {displayAvatar && (
                                        <button
                                            type="button"
                                            onClick={removeAvatar}
                                            className="relative z-30 flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600"
                                        >
                                            <Trash2 size={14} />{' '}
                                            {t('Remove Picture')}
                                        </button>
                                    )}
                                    {errors.avatar && (
                                        <p className="mt-1 text-xs text-rose-500">
                                            {errors.avatar}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* --- BASIC INFO SECTION --- */}
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-5 md:col-span-2">
                                    <h4 className="flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">
                                        <User size={16} /> {t('Basic Info')}
                                    </h4>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div>
                                            <div className="mb-1 flex items-end justify-between">
                                                <label className="block text-sm font-bold text-slate-700">
                                                    {t('Profile Name')}
                                                </label>
                                                <span
                                                    className={`text-xs font-bold ${data.name.length >= 50 ? 'text-rose-500' : 'text-slate-400'}`}
                                                >
                                                    {data.name.length}/50
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                maxLength={50}
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition-colors outline-none focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-xs text-rose-500">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-end justify-between">
                                                <label className="block text-sm font-bold text-slate-700">
                                                    {t('Username')}
                                                </label>
                                                <span
                                                    className={`text-xs font-bold ${data.username.length >= 30 ? 'text-rose-500' : 'text-slate-400'}`}
                                                >
                                                    {data.username.length}/30
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <AtSign
                                                    size={16}
                                                    className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                                                />
                                                <input
                                                    type="text"
                                                    maxLength={30}
                                                    value={data.username}
                                                    onChange={(e) => {
                                                        setData(
                                                            'username',
                                                            e.target.value
                                                                .replace(
                                                                    /\s/g,
                                                                    '',
                                                                )
                                                                .toLowerCase(),
                                                        );
                                                        setUsernameStatus(
                                                            'idle',
                                                        );

                                                        if (errors.username)
                                                            clearErrors(
                                                                'username',
                                                            );
                                                    }}
                                                    className={`w-full rounded-xl border bg-slate-50/50 py-3 pr-10 pl-10 text-sm transition-colors outline-none focus:bg-white focus:ring-1 ${
                                                        usernameStatus ===
                                                        'taken'
                                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                                                            : usernameStatus ===
                                                                'available'
                                                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500'
                                                              : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500'
                                                    }`}
                                                />

                                                {usernameStatus ===
                                                    'checking' && (
                                                    <div className="absolute top-1/2 right-4 -translate-y-1/2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-purple-600"></div>
                                                    </div>
                                                )}
                                                {usernameStatus ===
                                                    'available' && (
                                                    <CheckCircle2
                                                        size={16}
                                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-500"
                                                    />
                                                )}
                                                {usernameStatus === 'taken' && (
                                                    <XCircle
                                                        size={16}
                                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-rose-500"
                                                    />
                                                )}
                                            </div>

                                            {usernameStatus === 'available' &&
                                                !errors.username && (
                                                    <p className="mt-1.5 text-xs font-bold text-emerald-600">
                                                        {t(
                                                            'Looks good! This username is available.',
                                                        )}
                                                    </p>
                                                )}
                                            {usernameStatus === 'taken' &&
                                                !errors.username && (
                                                    <p className="mt-1.5 text-xs font-bold text-rose-600">
                                                        {t(
                                                            'This username is already taken.',
                                                        )}
                                                    </p>
                                                )}
                                            {errors.username && (
                                                <p className="mt-1.5 text-xs font-bold text-rose-500">
                                                    {errors.username}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-bold text-slate-700">
                                            {t('Bio')}
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={data.bio}
                                            onChange={(e) =>
                                                setData('bio', e.target.value)
                                            }
                                            placeholder={t(
                                                'Tell the world what you create...',
                                            )}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm transition-colors outline-none focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* --- SOCIAL LINKS SECTION --- */}
                                <div className="space-y-5 md:col-span-2">
                                    <h4 className="mt-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold tracking-wider text-slate-400 uppercase">
                                        <LinkIcon size={16} />{' '}
                                        {t('Social Links')}
                                    </h4>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="relative md:col-span-2">
                                            <Globe
                                                size={18}
                                                className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                                            />
                                            <input
                                                type="url"
                                                placeholder="https://yourwebsite.com"
                                                value={data.website}
                                                onChange={(e) =>
                                                    setData(
                                                        'website',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-11 text-sm transition-colors outline-none focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Github
                                                size={18}
                                                className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                                            />
                                            <input
                                                type="text"
                                                placeholder="github.com/username"
                                                value={data.github}
                                                onChange={(e) =>
                                                    setData(
                                                        'github',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-11 text-sm transition-colors outline-none focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Instagram
                                                size={18}
                                                className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                                            />
                                            <input
                                                type="text"
                                                placeholder="instagram.com/username"
                                                value={data.instagram}
                                                onChange={(e) =>
                                                    setData(
                                                        'instagram',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pr-4 pl-11 text-sm transition-colors outline-none focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end border-t border-slate-100 pt-6">
                                <button
                                    disabled={
                                        processing || usernameStatus === 'taken'
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3 text-sm font-bold text-white shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                >
                                    <Save size={18} /> {t('Save Profile')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
