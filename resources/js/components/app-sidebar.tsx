import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard, inbox } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart2, Book, Bot, CreditCard, FileText, Key, Layers, LayoutGrid, Lock, MessageSquare, Settings, Shield, Sparkles, Users, Webhook } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart2,
    },
    {
        title: 'Conversations',
        href: inbox(),
        icon: MessageSquare,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: Lock,
    },
    {
        title: 'Skills',
        href: '/admin/skills',
        icon: Sparkles,
    },
    {
        title: 'Queues',
        href: '/admin/queues',
        icon: Layers,
    },
    {
        title: 'Handoff Policies',
        href: '/admin/handoff-policies',
        icon: Shield,
    },
    {
        title: 'Knowledge Base',
        href: '/admin/kb',
        icon: Book,
    },
    {
        title: 'AI Persona',
        href: '/admin/persona',
        icon: Bot,
    },
    {
        title: 'Webhooks',
        href: '/admin/webhooks',
        icon: Webhook,
    },
    {
        title: 'API Keys',
        href: '/admin/api-keys',
        icon: Key,
    },
    {
        title: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: FileText,
    },
    {
        title: 'Settings',
        href: '/settings/appearance', // Using existing settings route
        icon: Settings,
    },
    {
        title: 'Billing',
        href: '/billing',
        icon: CreditCard,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
