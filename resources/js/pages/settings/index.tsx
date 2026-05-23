import { Head, useForm, router } from '@inertiajs/react';
import {
    Lock,
    Trash2,
    Shield,
    AlertTriangle,
    X,
    Mail,
    CheckCircle2,
} from 'lucide-react';
// --- ADDED: useCallback to the imports ---
import { useState, useRef, useEffect, useCallback } from 'react';
import InputError from '@/components/input-error';
import Navbar from '@/components/navbar';
import PasswordInput from '@/components/password-input';
import { toast } from '@/components/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function Settings({ auth }: any) {
    const user = auth.user;

    // ==========================================
    // --- EMAIL UPDATE LOGIC ---
    // ==========================================
    const needsVerification = user.email_verified_at === null;
    const [showOtpModal, setShowOtpModal] = useState(needsVerification);

    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const {
        data: profileData,
        setData: setProfileData,
        patch: updateProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm({
        name: user.name || '',
        email: user.email || '',
    });

    const isEmailUnchanged = profileData.email === user.email;

    const submitEmail = (e: React.FormEvent) => {
        e.preventDefault();

        updateProfile(route('settings.email.update'), {
            preserveScroll: true,
            onSuccess: (page: any) => {
                if (page.props.flash?.require_otp) {
                    setShowOtpModal(true);
                } else {
                    toast('Email updated successfully!', 'success');
                }
            },
            onError: () =>
                toast('Failed to update email. Check for errors.', 'error'),
        });
    };

    const {
        data: otpData,
        setData: setOtpData,
        post: verifyOtp,
        processing: otpProcessing,
        errors: otpErrors,
        reset: resetOtp,
    } = useForm({
        otp: '',
    });

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;

        const newOtp = [...otpValues];
        newOtp[index] = value.substring(value.length - 1);
        setOtpValues(newOtp);
        setOtpData('otp', newOtp.join(''));

        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...otpValues];

            if (otpValues[index] !== '') {
                // 1. Jika ADA isinya: Hapus angkanya...
                newOtp[index] = '';
                setOtpValues(newOtp);
                setOtpData('otp', newOtp.join(''));

                // ...DAN langsung pindah ke kotak sebelumnya
                if (index > 0) {
                    inputRefs.current[index - 1]?.focus();
                }
            } else if (index > 0) {
                // 2. Jika KOSONG: Hanya pindah mundur (tidak menghapus)
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData('text')
            .replace(/[^0-9]/g, '')
            .slice(0, 6);

        if (pastedData) {
            const newOtp = [...otpValues];

            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }

            setOtpValues(newOtp);
            setOtpData('otp', newOtp.join(''));

            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    // --- FIXED: Wrapped in useCallback ---
    const submitOtp = useCallback(
        (e?: React.FormEvent | Event) => {
            if (e) e.preventDefault();

            verifyOtp(route('settings.email.verify'), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowOtpModal(false);
                    resetOtp();
                    setOtpValues(['', '', '', '', '', '']);
                    toast('Email verified successfully!', 'success');
                },
            });
        },
        [verifyOtp, resetOtp],
    );

    // --- FIXED: Wrapped in useCallback ---
    const closeOtpModal = useCallback(() => {
        setShowOtpModal(false);
        resetOtp();
        setOtpValues(['', '', '', '', '', '']);
        setProfileData('email', user.email);
    }, [resetOtp, setProfileData, user.email]);

    // ==========================================
    // --- PASSWORD UPDATE LOGIC ---
    // ==========================================
    const {
        data: pwdData,
        setData: setPwdData,
        put: updatePassword,
        processing: pwdProcessing,
        reset: resetPwd,
        errors: pwdErrors,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        updatePassword(route('user-password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                resetPwd();
                toast('Password securely updated!', 'success');
            },
            onError: () =>
                toast('Failed to update password. Check for errors.', 'error'),
        });
    };

    const sendResetEmail = () => {
        router.post(
            route('password.email-logged-in'),
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast('Reset link sent to your email!', 'success'),
                onError: () => toast('Failed to send reset link.', 'error'),
            },
        );
    };

    // ==========================================
    // --- ACCOUNT DELETION LOGIC ---
    // ==========================================
    const [showDeleteOtpModal, setShowDeleteOtpModal] = useState(false);
    const [deleteOtpValues, setDeleteOtpValues] = useState([
        '',
        '',
        '',
        '',
        '',
        '',
    ]);
    const deleteInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);

    const {
        data: deleteData,
        setData: setDeleteData,
        delete: destroyUser,
        processing: deleteProcessing,
        errors: deleteErrors,
        reset: resetDelete,
        clearErrors: clearDeleteErrors,
    } = useForm({
        otp: '',
    });

    const requestDeletionOtp = () => {
        setIsRequestingDeletion(true);
        router.post(
            route('settings.destroy.otp'),
            {},
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    setIsRequestingDeletion(false);

                    if (page.props.flash?.require_delete_otp) {
                        setShowDeleteOtpModal(true);
                    } else {
                        setShowDeleteOtpModal(true);
                    }
                },
                onError: () => {
                    setIsRequestingDeletion(false);
                    toast('Failed to request deletion code.', 'error');
                },
            },
        );
    };

    const handleDeleteOtpChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;

        const newOtp = [...deleteOtpValues];
        newOtp[index] = value.substring(value.length - 1);
        setDeleteOtpValues(newOtp);
        setDeleteData('otp', newOtp.join(''));

        if (value && index < 5 && deleteInputRefs.current[index + 1]) {
            deleteInputRefs.current[index + 1]?.focus();
        }
    };

    const handleDeleteOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...deleteOtpValues];

            if (deleteOtpValues[index] !== '') {
                // 1. Jika ADA isinya: Hapus angkanya...
                newOtp[index] = '';
                setDeleteOtpValues(newOtp);
                setDeleteData('otp', newOtp.join(''));

                // ...DAN langsung pindah ke kotak sebelumnya
                if (index > 0) {
                    deleteInputRefs.current[index - 1]?.focus();
                }
            } else if (index > 0) {
                // 2. Jika KOSONG: Hanya pindah mundur (tidak menghapus)
                deleteInputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            deleteInputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            deleteInputRefs.current[index + 1]?.focus();
        }
    };

    const handleDeleteOtpPaste = (
        e: React.ClipboardEvent<HTMLInputElement>,
    ) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData('text')
            .replace(/[^0-9]/g, '')
            .slice(0, 6);

        if (pastedData) {
            const newOtp = [...deleteOtpValues];

            for (let i = 0; i < pastedData.length; i++)
                newOtp[i] = pastedData[i];

            setDeleteOtpValues(newOtp);
            setDeleteData('otp', newOtp.join(''));
            const focusIndex = Math.min(pastedData.length, 5);
            deleteInputRefs.current[focusIndex]?.focus();
        }
    };

    // --- FIXED: Wrapped in useCallback ---
    const confirmAccountDeletion = useCallback(
        (e?: React.FormEvent | Event) => {
            if (e) e.preventDefault();

            destroyUser(route('settings.destroy'), {
                preserveScroll: true,
                onError: () => {
                    setDeleteOtpValues(['', '', '', '', '', '']);
                    setDeleteData('otp', '');
                    deleteInputRefs.current[0]?.focus();
                    toast('Invalid or expired code.', 'error');
                },
            });
        },
        [destroyUser, setDeleteData],
    );

    // --- FIXED: Wrapped in useCallback ---
    const closeDeleteModal = useCallback(() => {
        setShowDeleteOtpModal(false);
        resetDelete();
        clearDeleteErrors();
        setDeleteOtpValues(['', '', '', '', '', '']);
    }, [resetDelete, clearDeleteErrors]);

    // ==========================================
    // --- MODAL SCROLL LOCK & KEYBOARD LOGIC ---
    // ==========================================
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showOtpModal) closeOtpModal();

                if (showDeleteOtpModal) closeDeleteModal();
            }

            if (e.key === 'Enter') {
                if (
                    showOtpModal &&
                    otpData.otp.length === 6 &&
                    !otpProcessing
                ) {
                    e.preventDefault();
                    submitOtp();
                } else if (
                    showDeleteOtpModal &&
                    deleteData.otp.length === 6 &&
                    !deleteProcessing
                ) {
                    e.preventDefault();
                    confirmAccountDeletion();
                }
            }
        };

        if (showOtpModal || showDeleteOtpModal) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleGlobalKeyDown);
        } else {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleGlobalKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [
        showOtpModal,
        showDeleteOtpModal,
        otpData.otp,
        deleteData.otp,
        otpProcessing,
        deleteProcessing,
        // --- ADDED: The required functions to the array ---
        closeOtpModal,
        submitOtp,
        closeDeleteModal,
        confirmAccountDeletion,
    ]);

    // ==========================================
    // --- RENDER ---
    // ==========================================
    return (
        <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-900">
            <Head title="Account Settings - Soko" />
            <Navbar />

            <main className="relative z-10 mx-auto max-w-4xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        Account Settings
                    </h1>
                    <p className="mt-2 text-lg text-slate-500">
                        Manage your security, preferences, and private data.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Email Settings Card */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5">
                        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:px-10">
                            <h2 className="flex items-center gap-3 text-lg font-black text-slate-900">
                                <Mail className="text-purple-500" size={24} />{' '}
                                Email Address
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Update the email address associated with your
                                account.
                            </p>
                        </div>
                        <form
                            onSubmit={submitEmail}
                            className="space-y-5 p-6 sm:p-10"
                        >
                            <div className="grid max-w-md gap-2">
                                <Label
                                    htmlFor="email"
                                    className="font-bold text-slate-700"
                                >
                                    Current Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) =>
                                        setProfileData('email', e.target.value)
                                    }
                                    className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-all focus:border-purple-400 focus:ring-0 focus:outline-none focus-visible:ring-0"
                                    required
                                />
                                <InputError
                                    message={profileErrors.email}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={
                                        profileProcessing || isEmailUnchanged
                                    }
                                    className="flex h-12 cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-8 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {profileProcessing ? (
                                        <Spinner className="mr-2 h-5 w-5" />
                                    ) : null}
                                    Save & Verify Email
                                </Button>

                                {!needsVerification && (
                                    <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                                        <CheckCircle2 size={16} /> Verified
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Security Card */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5">
                        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:px-10">
                            <h2 className="flex items-center gap-3 text-lg font-black text-slate-900">
                                <Shield className="text-purple-500" size={24} />{' '}
                                Security
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Ensure your account is using a long, random
                                password to stay secure.
                            </p>
                        </div>
                        <form
                            onSubmit={submitPassword}
                            className="space-y-5 p-6 sm:p-10"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Current Password
                                </label>
                                <div className="w-full max-w-md">
                                    <PasswordInput
                                        value={pwdData.current_password}
                                        onChange={(e) =>
                                            setPwdData(
                                                'current_password',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter current password"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-colors focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                    />

                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex-1">
                                            {pwdErrors.current_password && (
                                                <p className="flex items-center gap-1 text-xs text-rose-500">
                                                    <AlertTriangle size={12} />{' '}
                                                    {pwdErrors.current_password}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={sendResetEmail}
                                            className="cursor-pointer text-xs font-bold text-purple-600 transition-colors hover:text-purple-700 hover:underline"
                                        >
                                            Forgot current password?
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    New Password
                                </label>
                                <div className="w-full max-w-md">
                                    <PasswordInput
                                        value={pwdData.password}
                                        onChange={(e) =>
                                            setPwdData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Create new password"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-colors focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                    />
                                    {pwdErrors.password && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                                            <AlertTriangle size={12} />{' '}
                                            {pwdErrors.password}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Confirm New Password
                                </label>
                                <div className="w-full max-w-md">
                                    <PasswordInput
                                        value={pwdData.password_confirmation}
                                        onChange={(e) =>
                                            setPwdData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Confirm new password"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 shadow-sm transition-colors focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={pwdProcessing}
                                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    <Lock size={16} /> Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- Account Deletion Card (HIDDEN FOR ADMINS) --- */}
                    {user.role !== 'admin' && (
                        <div className="overflow-hidden rounded-3xl border border-rose-200/60 bg-white shadow-xl ring-1 shadow-rose-900/5">
                            <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-5 sm:px-10">
                                <h2 className="flex items-center gap-3 text-lg font-black text-rose-700">
                                    <AlertTriangle
                                        className="text-rose-500"
                                        size={24}
                                    />{' '}
                                    Account Deletion
                                </h2>
                            </div>
                            <div className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-10">
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        Delete Account
                                    </h3>
                                    <p className="mt-1 max-w-lg text-sm text-slate-500">
                                        Once your account is deleted, all of its
                                        resources and data will be permanently
                                        deleted. This action cannot be undone.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    onClick={requestDeletionOtp}
                                    disabled={isRequestingDeletion}
                                    className="flex h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-rose-100 bg-white px-6 text-sm font-bold text-rose-600 transition-all hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50"
                                >
                                    {isRequestingDeletion ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Trash2 size={18} className="mr-2" />
                                    )}
                                    Request Deletion
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* --- EMAIL OTP MODAL --- */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={closeOtpModal}
                    ></div>

                    <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-10">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                                <Mail size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">
                                Check your inbox
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                We sent a 6-digit verification code to <br />
                                <span className="font-bold text-slate-700">
                                    {profileData.email}
                                </span>
                            </p>
                            <p className="mt-2 text-xs font-medium text-slate-400">
                                Can't find it? Make sure to check your spam or
                                junk folder.
                            </p>
                        </div>

                        <form onSubmit={submitOtp}>
                            <div>
                                <label className="sr-only">Security Code</label>
                                <div className="flex justify-center gap-2 sm:gap-3">
                                    {otpValues.map((digit, index) => (
                                        <input
                                            key={`email-otp-${index}`}
                                            ref={(el) => {
                                                inputRefs.current[index] = el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) =>
                                                handleOtpChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleOtpKeyDown(index, e)
                                            }
                                            onPaste={handleOtpPaste}
                                            // KEMBALIKAN KE SELECT
                                            onFocus={(e) => e.target.select()}
                                            // KEMBALIKAN KE CARET-TRANSPARENT
                                            className="h-14 w-12 rounded-xl border border-slate-200 bg-slate-50/50 text-center text-2xl font-bold text-slate-900 caret-transparent shadow-sm transition-all selection:bg-purple-200 selection:text-purple-900 focus:border-purple-400 focus:ring-0 focus:outline-none sm:h-16 sm:w-14"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-center">
                                    <InputError
                                        message={otpErrors.otp}
                                        className="mt-4"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={
                                    otpProcessing || otpData.otp.length !== 6
                                }
                                className="cursor-pointeritems-center mt-6 flex h-14 w-full justify-center rounded-xl bg-slate-900 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {otpProcessing ? (
                                    <Spinner className="mr-2 h-5 w-5" />
                                ) : null}
                                Verify Account
                            </Button>

                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={closeOtpModal}
                                    className="cursor-pointer text-xs font-bold text-slate-400 transition-colors hover:text-slate-600 hover:underline"
                                >
                                    I'll verify later
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- URGENT DELETION OTP MODAL --- */}
            {showDeleteOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={closeDeleteModal}
                    ></div>

                    <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl sm:p-10">
                        <div className="absolute top-5 right-5">
                            <button
                                onClick={closeDeleteModal}
                                className="text-slate-400 transition-colors hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                                <AlertTriangle size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">
                                Verify Deletion
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                We sent a secure deletion code to <br />
                                <span className="font-bold text-slate-700">
                                    {user.email}
                                </span>
                            </p>
                            <p className="mt-2 text-xs font-medium text-slate-400">
                                Can't find it? Make sure to check your spam or
                                junk folder.
                            </p>
                        </div>

                        <form onSubmit={confirmAccountDeletion}>
                            <div>
                                <label className="sr-only">Security Code</label>
                                <div className="flex justify-center gap-2 sm:gap-3">
                                    {deleteOtpValues.map((digit, index) => (
                                        <input
                                            key={`delete-otp-${index}`}
                                            ref={(el) => {
                                                deleteInputRefs.current[index] =
                                                    el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) =>
                                                handleDeleteOtpChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleDeleteOtpKeyDown(index, e)
                                            }
                                            onPaste={handleDeleteOtpPaste}
                                            // KEMBALIKAN KE SELECT
                                            onFocus={(e) => e.target.select()}
                                            // KEMBALIKAN KE CARET-TRANSPARENT
                                            className="h-14 w-12 rounded-xl border border-rose-200 bg-rose-50/50 text-center text-2xl font-bold text-rose-900 caret-transparent shadow-sm transition-all selection:bg-rose-200 selection:text-rose-900 focus:border-rose-500 focus:ring-0 focus:outline-none sm:h-16 sm:w-14"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-center">
                                    <InputError
                                        message={deleteErrors.otp}
                                        className="mt-4"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={
                                    deleteProcessing ||
                                    deleteData.otp.length !== 6
                                }
                                className="mt-6 flex h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-rose-600 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/25 focus:outline-none disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {deleteProcessing ? (
                                    <Spinner className="mr-2 h-5 w-5" />
                                ) : null}
                                Permanently Delete Account
                            </Button>

                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="cursor-pointer text-xs font-bold text-slate-400 transition-colors hover:text-slate-600 hover:underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
