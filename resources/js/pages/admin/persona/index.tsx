import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { Bot, Key } from 'lucide-react';
import { useAgentAuth } from '@/lib/agent-auth';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'AI Persona',
        href: '/admin/persona',
    },
];

export default function PersonaIndex() {
    const { token, expiresAt, chatUrl, loading, error, submit, clear } = useAgentAuth();

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Persona" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Persona</h1>
                    <p className="text-muted-foreground mt-2">Configure the AI agent's personality and behavior.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Agent Session Token
                        </CardTitle>
                        <CardDescription>
                            Manage the authentication token used for agent operations in this session.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="text-sm font-medium">Status</div>
                                <div className="text-sm text-muted-foreground">
                                    {token ? (
                                        <span className="text-green-600 dark:text-green-400">Active (Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : 'Never'})</span>
                                    ) : (
                                        <span className="text-neutral-500">No active token</span>
                                    )}
                                </div>
                                {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => submit()} disabled={loading}>
                                    {loading ? 'Requesting...' : token ? 'Refresh Token' : 'Generate Token'}
                                </Button>
                                {token && (
                                    <Button variant="outline" onClick={() => clear()} disabled={loading}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {token && chatUrl && (
                            <div className="pt-4 border-t">
                                <div className="text-sm font-medium mb-2">Test Chat Portal</div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-muted rounded text-xs">{chatUrl}</code>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={chatUrl} target="_blank" rel="noopener noreferrer">
                                            Open Chat
                                        </a>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Use this link to simulate a user interacting with the agent.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            Agent Configuration
                        </CardTitle>
                        <CardDescription>
                            The AI persona defines how the agent interacts with users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Persona configuration features are currently in development.
                            Currently, the agent uses the default system prompt defined in the codebase.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
