import { Link, usePage, router } from '@inertiajs/react';
// --- NEW: Added BadgePercent to your lucide-react imports ---
import {
    LayoutGrid,
    Package,
    ShoppingBag,
    ShoppingCart,
    BadgePercent,
} from 'lucide-react';
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

export function AppSidebar() {
    const { auth } = usePage().props as any;

    const navItems = [
        { title: 'Storefront', href: '/products', icon: LayoutGrid },
        { title: 'My Purchases', href: '/purchases', icon: ShoppingBag },
        { title: 'My Cart', href: '/cart', icon: ShoppingCart },
    ];

    // --- UPDATED: Pushing multiple items for sellers ---
    if (auth.user && auth.user.role === 'seller') {
        navItems.push(
            {
                title: 'My Inventory',
                href: '/seller/products/mine',
                icon: Package,
            },
            {
                title: 'Promotions',
                href: '/seller/promotions',
                icon: BadgePercent,
            },
        );
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
                                {/* <AppLogo /> */}
                                <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-blue-600">
                                    Soko
                                </div>
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
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
