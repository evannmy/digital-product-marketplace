import { Head, Link, router } from '@inertiajs/react';
import {
    Shield,
    Trash2,
    Search,
    UserX,
    UserCheck,
    Filter,
    Activity,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '@/components/confirm-modal';
import Navbar from '@/components/navbar';
import { toast } from '@/components/toaster';

export default function Users({ users }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // --- NEW: Manual Processing State ---
    const [isProcessing, setIsProcessing] = useState(false);

    const userList = users?.data || users || [];

    // --- CLIENT-SIDE FILTERING ---
    const filteredUsers = userList.filter((user: any) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.username && user.username.toLowerCase().includes(query));

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        let matchesStatus = true;

        if (statusFilter === 'active') {
            matchesStatus = user.is_active === true || user.is_active === 1;
        } else if (statusFilter === 'suspended') {
            matchesStatus = user.is_active === false || user.is_active === 0;
        }

        return matchesSearch && matchesRole && matchesStatus;
    });

    // --- MODAL STATE MANAGEMENT ---
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        action: 'delete' | 'toggle' | null;
        user: any | null;
    }>({
        isOpen: false,
        action: null,
        user: null,
    });

    const promptDelete = (user: any) => {
        setModalConfig({ isOpen: true, action: 'delete', user });
    };

    const promptToggle = (user: any) => {
        setModalConfig({ isOpen: true, action: 'toggle', user });
    };

    const executeAction = () => {
        const { action, user } = modalConfig;

        if (!user) return;

        // Start the loading spinner
        setIsProcessing(true);

        if (action === 'delete') {
            router.delete(`/admin/users/${user.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setModalConfig({
                        isOpen: false,
                        action: null,
                        user: null,
                    });
                    toast(`"${user.name}" permanently deleted.`, 'delete');
                },
                onError: () => toast('Failed to delete user.', 'error'),
                onFinish: () => setIsProcessing(false), // <-- Stops the spinner
            });
        } else if (action === 'toggle') {
            router.patch(
                `/admin/users/${user.id}/toggle`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setModalConfig({
                            isOpen: false,
                            action: null,
                            user: null,
                        });
                        const statusText = user.is_active
                            ? 'suspended'
                            : 'reactivated';

                        const toastType = user.is_active ? 'info' : 'success';

                        toast(
                            `"${user.name}" is now ${statusText}.`,
                            toastType,
                        );
                    },
                    onError: () =>
                        toast('Failed to update user status.', 'error'),
                    onFinish: () => setIsProcessing(false), // <-- Stops the spinner
                },
            );
        }
    };

    const getModalText = () => {
        if (modalConfig.action === 'delete') {
            return {
                title: 'Delete User',
                message: `Are you sure you want to permanently delete "${modalConfig.user?.name}"? This action cannot be undone, and all their products and purchases will be lost.`,
                confirmText: 'Yes, delete it',
                variant: 'danger' as const,
            };
        }

        if (modalConfig.action === 'toggle') {
            const isSuspending = modalConfig.user?.is_active;

            return {
                title: isSuspending ? 'Suspend User' : 'Reactivate User',
                message: isSuspending
                    ? `Are you sure you want to suspend "${modalConfig.user?.name}"? They will not be able to log in or sell products.`
                    : `Are you sure you want to reactivate "${modalConfig.user?.name}"? Their access to the platform will be restored.`,
                confirmText: isSuspending
                    ? 'Yes, suspend it'
                    : 'Yes, reactivate it',

                variant: isSuspending
                    ? ('suspend' as const)
                    : ('reactivate' as const),
            };
        }

        return {
            title: '',
            message: '',
            confirmText: '',
            variant: 'danger' as const,
        };
    };

    const {
        title: modalTitle,
        message: modalMessage,
        confirmText: modalConfirmText,
        variant: modalVariant,
    } = getModalText();

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#FAFAFC] font-sans text-slate-900">
            <Head title="Manage Users - Soko Admin" />
            <Navbar />

            <main className="relative z-10 flex-1 pt-32 pb-24">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                Manage Users
                            </h1>
                            <p className="mt-2 text-slate-500">
                                View, filter, and manage all registered accounts
                                on the platform.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl ring-1 shadow-slate-900/5 ring-white">
                        {/* --- FILTER BAR --- */}
                        <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                            {/* Search */}
                            <div className="relative w-full lg:max-w-xs">
                                <Search
                                    size={18}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or username..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>

                            {/* Dropdown Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Role Filter */}
                                <div className="flex items-center gap-2">
                                    <Filter
                                        size={18}
                                        className="text-slate-400"
                                    />
                                    <select
                                        value={roleFilter}
                                        onChange={(e) =>
                                            setRoleFilter(e.target.value)
                                        }
                                        className="rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-4 text-sm font-medium text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="buyer">Buyers</option>
                                        <option value="seller">Sellers</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div className="flex items-center gap-2">
                                    <Activity
                                        size={18}
                                        className="text-slate-400"
                                    />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                        className="rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-4 text-sm font-medium text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                    >
                                        <option value="all">
                                            All Statuses
                                        </option>
                                        <option value="active">
                                            Active Only
                                        </option>
                                        <option value="suspended">
                                            Suspended Only
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            {filteredUsers.length === 0 ? (
                                <div className="py-10 text-center text-slate-500">
                                    No users found matching your filters.
                                </div>
                            ) : (
                                <>
                                    {/* === MOBILE CARD VIEW === */}
                                    <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                                        {filteredUsers.map((user: any) => (
                                            <div
                                                key={`mobile-${user.id}`}
                                                className={`flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 ${!user.is_active ? 'opacity-60' : ''}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold ${!user.is_active ? 'bg-slate-200 text-slate-400' : 'bg-slate-200/60 text-slate-700'}`}
                                                    >
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span
                                                                className={`truncate font-bold ${!user.is_active ? 'text-slate-500 line-through' : 'text-slate-900'}`}
                                                            >
                                                                {user.name}
                                                            </span>
                                                            {user.username && (
                                                                <span className="text-[11px] font-medium text-slate-400">
                                                                    @
                                                                    {
                                                                        user.username
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="mt-0.5 truncate text-xs text-slate-500">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${user.role === 'admin' ? 'bg-rose-50 text-rose-700 ring-rose-500/20' : user.role === 'seller' ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20' : 'bg-purple-50 text-purple-700 ring-purple-500/20'}`}
                                                    >
                                                        {user.role ===
                                                            'admin' && (
                                                            <Shield
                                                                size={12}
                                                                className="mr-1"
                                                            />
                                                        )}
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                                                    >
                                                        {user.is_active
                                                            ? 'Active'
                                                            : 'Suspended'}
                                                    </span>
                                                </div>

                                                {user.role !== 'admin' && (
                                                    <div className="grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-4">
                                                        <button
                                                            onClick={() =>
                                                                promptToggle(
                                                                    user,
                                                                )
                                                            }
                                                            className={`flex items-center justify-center rounded-lg p-2 transition-all ${
                                                                user.is_active
                                                                    ? 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                                                                    : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                                                            }`}
                                                            title={
                                                                user.is_active
                                                                    ? 'Suspend User'
                                                                    : 'Reactivate User'
                                                            }
                                                        >
                                                            {user.is_active ? (
                                                                <UserX
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <UserCheck
                                                                    size={16}
                                                                />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                promptDelete(
                                                                    user,
                                                                )
                                                            }
                                                            className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* === DESKTOP TABLE VIEW === */}
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-white text-slate-500">
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        User
                                                    </th>
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Role
                                                    </th>
                                                    <th className="px-8 py-5 font-bold tracking-wider uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-8 py-5 text-right font-bold tracking-wider uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredUsers.map(
                                                    (user: any) => (
                                                        <tr
                                                            key={`desktop-${user.id}`}
                                                            className={`transition-colors hover:bg-slate-50/50 ${!user.is_active ? 'opacity-60' : ''}`}
                                                        >
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${!user.is_active ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
                                                                    >
                                                                        {user.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div
                                                                                className={`font-bold ${!user.is_active ? 'text-slate-500 line-through' : 'text-slate-900'}`}
                                                                            >
                                                                                {
                                                                                    user.name
                                                                                }
                                                                            </div>
                                                                            {user.username && (
                                                                                <div className="text-[11px] font-medium text-slate-400">
                                                                                    @
                                                                                    {
                                                                                        user.username
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-0.5 text-xs text-slate-500">
                                                                            {
                                                                                user.email
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${user.role === 'admin' ? 'bg-rose-50 text-rose-700 ring-rose-500/20' : user.role === 'seller' ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20' : 'bg-purple-50 text-purple-700 ring-purple-500/20'}`}
                                                                >
                                                                    {user.role ===
                                                                        'admin' && (
                                                                        <Shield
                                                                            size={
                                                                                12
                                                                            }
                                                                            className="mr-1"
                                                                        />
                                                                    )}
                                                                    {user.role.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                                                                >
                                                                    {user.is_active
                                                                        ? 'Active'
                                                                        : 'Suspended'}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                {user.role !==
                                                                    'admin' && (
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                promptToggle(
                                                                                    user,
                                                                                )
                                                                            }
                                                                            title={
                                                                                user.is_active
                                                                                    ? 'Suspend User'
                                                                                    : 'Reactivate User'
                                                                            }
                                                                            className={`rounded-lg p-2 transition-colors ${user.is_active ? 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600' : 'bg-rose-50 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600'}`}
                                                                        >
                                                                            {user.is_active ? (
                                                                                <UserX
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <UserCheck
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                promptDelete(
                                                                                    user,
                                                                                )
                                                                            }
                                                                            title="Delete Permanently"
                                                                            className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                                                        >
                                                                            <Trash2
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* --- PAGINATION --- */}
                        {users?.links && users.links.length > 3 && (
                            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
                                <div className="flex flex-wrap items-center justify-center gap-1">
                                    {users.links.map(
                                        (link: any, index: number) =>
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                                        link.active
                                                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                                            : 'text-slate-600 hover:bg-slate-100'
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 text-sm font-medium text-slate-400"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- CONFIRMATION MODAL --- */}
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() =>
                    setModalConfig({
                        isOpen: false,
                        action: null,
                        user: null,
                    })
                }
                onConfirm={executeAction}
                title={modalTitle}
                message={modalMessage}
                confirmText={modalConfirmText}
                variant={modalVariant}
                isProcessing={isProcessing} // <-- PASSED THE STATE DOWN
            />
        </div>
    );
}
