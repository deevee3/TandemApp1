import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createQueueItemsHeaders, useQueueItems } from '@/hooks/use-queue-items';
import { useAgentAuthToken } from '@/hooks/use-agent-auth';
import AppLayout from '@/layouts/app-layout';
import { inbox } from '@/routes';
import Api from '@/actions/App/Http/Controllers/Api';
import ConversationRoutes from '@/actions/App/Http/Controllers/ConversationController';
import { type BreadcrumbItem, type QueueItemPayload, type QueueSummary, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inbox',
        href: inbox().url,
    },
];

const queueStateFilters: { label: string; value: string | null }[] = [
    { label: 'All', value: null },
    { label: 'Queued', value: 'queued' },
    { label: 'Bot Active', value: 'bot_active' },
    { label: 'Hot', value: 'hot' },
    { label: 'Completed', value: 'completed' },
];

const queueIdStorageKey = 'inbox.queueId';
const queueStateStorageKey = 'inbox.state';
const allStateOptionValue = '__all__';

function usePersistedQueuePreferences(defaultQueueId: number | null) {
    const [queueId, setQueueId] = useState<number | null>(defaultQueueId);
    const [state, setState] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const storedQueueId = window.localStorage.getItem(queueIdStorageKey);
        if (storedQueueId) {
            const parsed = Number.parseInt(storedQueueId, 10);
            if (!Number.isNaN(parsed)) {
                setQueueId(parsed);
            }
        } else {
            setQueueId(defaultQueueId);
        }

        const storedState = window.localStorage.getItem(queueStateStorageKey);
        setState(storedState && storedState !== '' ? storedState : null);
    }, [defaultQueueId]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (queueId === null || Number.isNaN(queueId)) {
            window.localStorage.removeItem(queueIdStorageKey);
        } else {
            window.localStorage.setItem(queueIdStorageKey, queueId.toString());
        }
    }, [queueId]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (!state) {
            window.localStorage.removeItem(queueStateStorageKey);
        } else {
            window.localStorage.setItem(queueStateStorageKey, state);
        }
    }, [state]);

    const updateQueueId = (next: number | null) => {
        setQueueId(next);
    };

    const updateState = (next: string | null) => {
        setState(next && next !== '' ? next : null);
    };

    return {
        queueId,
        state,
        updateQueueId,
        updateState,
    };
}

export default function InboxPage() {
    const page = usePage<SharedData & { queues: QueueSummary[]; defaultQueueId: number | null; apiKey: string | null }>();
    const { queues, defaultQueueId, apiKey } = page.props;

    const agentToken = useAgentAuthToken();

    const { queueId, state, updateQueueId, updateState } = usePersistedQueuePreferences(defaultQueueId ?? (queues[0]?.id ?? null));

    const queueOptions = useMemo(() => queues ?? [], [queues]);
    const firstQueueId = queueOptions.length > 0 ? queueOptions[0].id : null;
    const selectedQueueId = queueId ?? firstQueueId ?? null;

    const authenticatedUserId = page.props.auth?.user?.id ?? null;
    const defaultActorId = authenticatedUserId ? String(authenticatedUserId) : '';

    const { items, loading, error, pagination, filters, refresh } = useQueueItems({
        queueId: selectedQueueId ?? 0,
        state,
        perPage: 25,
        apiKey: apiKey ?? undefined,
    });

    const [claimingItem, setClaimingItem] = useState<QueueItemPayload | null>(null);
    const [claiming, setClaiming] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);
    const [actorId, setActorId] = useState(defaultActorId);
    const [assignmentUserId, setAssignmentUserId] = useState(defaultActorId);
    const [assignmentMetadata, setAssignmentMetadata] = useState('');

    useEffect(() => {
        setClaimError(null);
        if (!claimingItem) {
            setActorId(defaultActorId);
            setAssignmentUserId(defaultActorId);
            setAssignmentMetadata('');
        }
    }, [claimingItem, defaultActorId]);

    const handleSubmitClaim = useCallback(async () => {
        if (!claimingItem) {
            return;
        }

        const route = Api.QueueItemController.claim({
            queue: claimingItem.queue_id,
            queueItem: claimingItem.id,
        });

        const parsedActorId = Number.parseInt(actorId, 10);
        const parsedAssignmentUserId = Number.parseInt(assignmentUserId, 10);

        if (Number.isNaN(parsedActorId) || Number.isNaN(parsedAssignmentUserId)) {
            setClaimError('Actor ID and Assignment User ID must be valid numbers.');
            return;
        }

        let metadata: Record<string, unknown> | undefined;
        if (assignmentMetadata.trim() !== '') {
            try {
                metadata = JSON.parse(assignmentMetadata);
            } catch (parseError) {
                setClaimError('Assignment metadata must be valid JSON.');
                return;
            }
        }

        setClaiming(true);
        setClaimError(null);

        try {
            const response = await fetch(route.url, {
                method: 'POST',
                headers: createQueueItemsHeaders(agentToken, apiKey ?? undefined),
                body: JSON.stringify({
                    actor_id: parsedActorId,
                    assignment_user_id: parsedAssignmentUserId,
                    assignment_metadata: metadata,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const message = payload?.message ?? 'Failed to claim queue item.';
                throw new Error(message);
            }

            setClaimingItem(null);
            setActorId(defaultActorId);
            setAssignmentUserId(defaultActorId);
            setAssignmentMetadata('');
            await refresh();
        } catch (caught) {
            const err = caught as Error;
            setClaimError(err.message);
        } finally {
            setClaiming(false);
        }
    }, [assignmentMetadata, assignmentUserId, claimingItem, actorId, apiKey, defaultActorId, refresh]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inbox" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden">
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader className="flex flex-col gap-2">
                        <CardTitle className="text-lg font-semibold">Queue Filters</CardTitle>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400">Queue</label>
                                <Select
                                    value={selectedQueueId ? String(selectedQueueId) : (firstQueueId ? String(firstQueueId) : '')}
                                    onValueChange={(value) => {
                                        const nextId = Number.parseInt(value, 10);
                                        updateQueueId(Number.isNaN(nextId) ? null : nextId);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select queue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {queueOptions.map((queue) => (
                                            <SelectItem key={queue.id} value={String(queue.id)}>
                                                {queue.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400">State</label>
                                <Select
                                    value={state ?? allStateOptionValue}
                                    onValueChange={(value) => {
                                        updateState(value === allStateOptionValue ? null : value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All states" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {queueStateFilters.map(({ label, value }) => (
                                            <SelectItem key={label} value={value ?? allStateOptionValue}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between border-t border-sidebar-border/60 bg-neutral-50/60 px-6 py-4 dark:border-sidebar-border dark:bg-neutral-900/40">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {loading ? 'Refreshing queue…' : `${pagination.total} items`}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
                                Refresh
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {error ? (
                    <Card className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                        <CardHeader>
                            <CardTitle className="text-base">Unable to load queue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{error}</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" onClick={() => refresh()}>
                                Try again
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <QueueItemTable
                            items={items}
                            loading={loading}
                            onClaim={(item) => {
                                setClaimingItem(item);
                            }}
                        />
                    </div>
                )}
            </div>

            <ClaimDialog
                open={claimingItem !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setClaimingItem(null);
                    }
                }}
                queueItem={claimingItem}
                actorId={actorId}
                onActorIdChange={setActorId}
                assignmentUserId={assignmentUserId}
                onAssignmentUserIdChange={setAssignmentUserId}
                assignmentMetadata={assignmentMetadata}
                onAssignmentMetadataChange={setAssignmentMetadata}
                onSubmit={handleSubmitClaim}
                submitting={claiming}
                error={claimError}
            />
        </AppLayout>
    );
}

function QueueItemTable({ items, loading, onClaim }: { items: QueueItemPayload[]; loading: boolean; onClaim: (item: QueueItemPayload) => void }) {
    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Loading queue…</span>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">No queue items found for the selected filters.</span>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                <thead className="bg-neutral-50/80 font-medium uppercase tracking-wide text-neutral-500 dark:bg-neutral-900/50 dark:text-neutral-400">
                    <tr>
                        <th className="px-4 py-3 text-left">Conversation</th>
                        <th className="px-4 py-3 text-left">State</th>
                        <th className="px-4 py-3 text-left">Priority</th>
                        <th className="px-4 py-3 text-left">Latest Message</th>
                        <th className="px-4 py-3 text-left">Last Activity</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {items.map((item) => (
                        <QueueItemRow key={item.id} item={item} onClaim={onClaim} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function QueueItemRow({ item, onClaim }: { item: QueueItemPayload; onClaim: (item: QueueItemPayload) => void }) {
    const conversation = item.conversation;
    const conversationUrl = conversation ? ConversationRoutes.show({ conversation: conversation.id }).url : null;

    return (
        <tr className="bg-white transition hover:bg-neutral-50/80 dark:bg-neutral-950/40 dark:hover:bg-neutral-900/50">
            <td className="max-w-[16rem] px-4 py-3 align-top">
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {conversation?.subject ?? 'Untitled conversation'}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Requester: {conversation?.requester.identifier ?? 'Unknown'}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3 align-top">
                <Badge variant={badgeVariantForState(item.state)} className="capitalize">
                    {item.state.replace('_', ' ')}
                </Badge>
            </td>
            <td className="px-4 py-3 align-top">
                <Badge variant="outline" className="capitalize">
                    {conversation?.priority ?? 'standard'}
                </Badge>
            </td>
            <td className="max-w-[24rem] px-4 py-3 align-top">
                {conversation?.latest_message ? (
                    <div className="flex flex-col gap-1">
                        <span className="line-clamp-2 text-sm text-neutral-700 dark:text-neutral-200">
                            {conversation.latest_message.content}
                        </span>
                        <span className="text-xs text-neutral-400">
                            {conversation.latest_message.sender_type}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs text-neutral-400">No messages yet</span>
                )}
            </td>
            <td className="px-4 py-3 align-top">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {conversation?.last_activity_at ? new Date(conversation.last_activity_at).toLocaleString() : '—'}
                </span>
            </td>
            <td className="px-4 py-3 align-top">
                <div className="flex flex-wrap items-center gap-2">
                    {conversationUrl ? (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={conversationUrl}>Open</Link>
                        </Button>
                    ) : (
                        <span className="text-xs text-neutral-400">Conversation unavailable</span>
                    )}
                    {item.state === 'queued' ? (
                        <Button size="sm" onClick={() => onClaim(item)}>
                            Claim
                        </Button>
                    ) : (
                        <span className="text-xs text-neutral-400">—</span>
                    )}
                </div>
            </td>
        </tr>
    );
}


function badgeVariantForState(state: string): 'default' | 'secondary' | 'outline' {
    switch (state) {
        case 'queued':
            return 'default';
        case 'hot':
            return 'secondary';
        case 'completed':
            return 'outline';
        default:
            return 'outline';
    }
}

function ClaimDialog({
    open,
    onOpenChange,
    queueItem,
    actorId,
    onActorIdChange,
    assignmentUserId,
    onAssignmentUserIdChange,
    assignmentMetadata,
    onAssignmentMetadataChange,
    onSubmit,
    submitting,
    error,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    queueItem: QueueItemPayload | null;
    actorId: string;
    onActorIdChange: (id: string) => void;
    assignmentUserId: string;
    onAssignmentUserIdChange: (id: string) => void;
    assignmentMetadata: string;
    onAssignmentMetadataChange: (metadata: string) => void;
    onSubmit: () => Promise<void>;
    submitting: boolean;
    error: string | null;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {queueItem?.conversation?.subject ? `Claim “${queueItem.conversation.subject}”` : 'Claim queue item'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="actor-id">
                            Actor ID
                        </label>
                        <Input
                            id="actor-id"
                            value={actorId}
                            onChange={(event) => onActorIdChange(event.target.value)}
                            placeholder="Your user ID"
                            type="number"
                            min={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="assignment-user-id">
                            Assignment User ID
                        </label>
                        <Input
                            id="assignment-user-id"
                            value={assignmentUserId}
                            onChange={(event) => onAssignmentUserIdChange(event.target.value)}
                            placeholder="Assignee user ID"
                            type="number"
                            min={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="assignment-metadata">
                            Assignment Metadata (JSON, optional)
                        </label>
                        <Input
                            id="assignment-metadata"
                            value={assignmentMetadata}
                            onChange={(event) => onAssignmentMetadataChange(event.target.value)}
                            placeholder='{ "channel": "web" }'
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                </div>
                <DialogFooter className="flex items-center justify-between gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={() => void onSubmit()} disabled={submitting || !actorId || !assignmentUserId}>
                        {submitting ? 'Claiming…' : 'Claim item'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
