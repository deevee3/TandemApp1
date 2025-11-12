import { useMemo } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAgentAuth } from '@/lib/agent-auth';
import { AlertCircle, Clock } from 'lucide-react';

interface AgentTokenBannerProps {
    className?: string;
}

function formatExpiration(expiresAt: string | null): { label: string; remainingMinutes: number | null } {
    if (!expiresAt) {
        return { label: 'Unknown', remainingMinutes: null };
    }

    const timestamp = Date.parse(expiresAt);
    if (Number.isNaN(timestamp)) {
        return { label: 'Unknown', remainingMinutes: null };
    }

    const secondsRemaining = Math.max(Math.floor((timestamp - Date.now()) / 1000), 0);
    const minutesRemaining = Math.floor(secondsRemaining / 60);
    const formatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return {
        label: formatter.format(new Date(timestamp)),
        remainingMinutes: minutesRemaining,
    };
}

export function AgentTokenBanner({ className }: AgentTokenBannerProps) {
    const { token, expiresAt, loading, error, submit, clear } = useAgentAuth();

    const { label: expiryLabel, remainingMinutes } = useMemo(() => formatExpiration(expiresAt), [expiresAt]);

    const shouldWarnExpiration = token && remainingMinutes !== null && remainingMinutes <= 5;
    const shouldShow = Boolean(error) || !token || shouldWarnExpiration;

    if (!shouldShow) {
        return null;
    }

    const Icon = error ? AlertCircle : Clock;

    const title = error ? 'Unable to issue agent token' : token ? 'Agent token expiring soon' : 'Agent token required';

    const description = error
        ? error
        : token
            ? remainingMinutes !== null
                ? `Your stored agent token expires at ${expiryLabel}. Refresh it to avoid interruptions.`
                : 'Your stored agent token is nearing expiry. Refresh it to avoid interruptions.'
            : 'Request an agent token to authenticate Inbox API calls for this session.';

    const primaryLabel = loading ? 'Requesting…' : token ? 'Refresh token' : 'Generate token';

    return (
        <Alert variant={error ? 'destructive' : 'default'} className={cn('space-y-3', className)}>
            <Icon className="h-5 w-5" />
            <div>
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>
                    <p>{description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button type="button" size="sm" onClick={() => submit()} disabled={loading}>
                            {primaryLabel}
                        </Button>
                        {token && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => clear()} disabled={loading}>
                                Clear token
                            </Button>
                        )}
                    </div>
                </AlertDescription>
            </div>
        </Alert>
    );
}
