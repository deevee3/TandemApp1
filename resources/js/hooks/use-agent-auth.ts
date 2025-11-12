import { useMemo } from 'react';

import { useAgentAuth } from '@/lib/agent-auth';

export function useAgentAuthToken(): string | null {
    const { token, expiresAt, clear } = useAgentAuth();

    return useMemo(() => {
        if (!token) {
            return null;
        }

        if (!expiresAt) {
            return token;
        }

        const expiry = new Date(expiresAt).getTime();
        const now = Date.now();

        if (Number.isNaN(expiry) || expiry > now) {
            return token;
        }

        clear();
        return null;
    }, [token, expiresAt, clear]);
}
