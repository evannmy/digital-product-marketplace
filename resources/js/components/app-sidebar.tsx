import { Link, usePage, router } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    LayoutGrid,
    Package,
    ShoppingBag,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;

    const navItems = [
        { title: 'Storefront', href: '/products', icon: LayoutGrid },
        { title: 'My Purchases', href: '/purchases', icon: ShoppingBag },
    ];

    // Check against the role string
    if (auth.user && auth.user.role === 'seller') {
        navItems.push({
            title: 'My Inventory',
            href: '/seller/products/mine',
            icon: Package,
        });
    }

    const upgradeToSeller = () => {
        if (window.confirm('Ready to start earning? Become a seller today!')) {
            router.post('/onboarding/seller');
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />

                {/* Onboarding Button for anyone who is NOT a seller */}
                {auth.user && auth.user.role !== 'seller' && (
                    <div className="mt-6 px-4">
                        <button
                            onClick={upgradeToSeller}
                            className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Become a Seller
                        </button>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
