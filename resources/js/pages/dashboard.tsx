import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
    stats: Array<{
        title: string;
        value: string;
        change: string;
        trend: 'up' | 'down' | 'neutral';
        description: string;
    }>;
    activities: Array<{
        user: string;
        action: string;
        time: string;
        initials: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ stats, activities }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const systemStatus = [
        { name: 'API', status: 'operational' },
        { name: 'Database', status: 'operational' },
        { name: 'AI Engine', status: 'operational' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Good morning, {user.name}</h1>
                        <p className="text-muted-foreground">Here's what's happening today.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium">Overview</h2>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/analytics">Full Report</Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {stats.map((stat, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    {stat.trend === 'up' ? (
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                    ) : stat.trend === 'down' ? (
                                        <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                                    ) : null}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        <span className={stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}>
                                            {stat.change}
                                        </span>{' '}
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Recent Activity */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>Latest system audit logs.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/audit-logs">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {activities.length > 0 ? activities.map((activity, index) => (
                                    <div className="flex items-center" key={index}>
                                        <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                            {activity.initials}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{activity.user}</p>
                                            <p className="text-sm text-muted-foreground">{activity.action}</p>
                                        </div>
                                        <div className="ml-auto text-xs font-medium text-muted-foreground">{activity.time}</div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Status</CardTitle>
                            <CardDescription>All systems operational</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {systemStatus.map((status, index) => (
                                    <div className="flex items-center justify-between" key={index}>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium">{status.name}</span>
                                        </div>
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-500 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400">
                                            Operational
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
