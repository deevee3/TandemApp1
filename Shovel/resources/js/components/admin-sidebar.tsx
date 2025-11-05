import { NavFooter } from '@/components/nav-footer';
import { NavAdmin } from '@/components/nav-admin';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    BarChart3, 
    BookOpen, 
    FileText, 
    Folder, 
    Key, 
    LayoutGrid, 
    Shield, 
    Sparkles, 
    Users, 
    Webhook 
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutGrid,
    },
    {
        title: 'Users & Roles',
        icon: Users,
        items: [
            {
                title: 'Users',
                href: '/admin/users',
            },
            {
                title: 'Roles',
                href: '/admin/roles',
            },
        ],
    },
    {
        title: 'Skills',
        href: '/admin/skills',
        icon: Sparkles,
    },
    {
        title: 'Queues',
        href: '/admin/queues',
        icon: Folder,
    },
    {
        title: 'Handoff Policies',
        href: '/admin/handoff-policies',
        icon: Shield,
    },
    {
        title: 'API Keys',
        href: '/admin/api-keys',
        icon: Key,
    },
    {
        title: 'Webhooks',
        href: '/admin/webhooks',
        icon: Webhook,
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: FileText,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs',
        icon: BookOpen,
    },
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavAdmin items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
