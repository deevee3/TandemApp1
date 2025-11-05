import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { token as agentTokenRoute } from '@/routes/agent-session';
import { getCsrfToken } from '@/lib/utils';

type AgentAuthState = {
    token: string | null;
    expiresAt: string | null;
    issuedAt: string | null;
    loading: boolean;
    error: string | null;
    submit: () => Promise<void>;
    clear: () => void;
};

const storageKey = 'agentAuth.token';
const storageExpiryKey = 'agentAuth.expiresAt';
const storageIssuedAtKey = 'agentAuth.issuedAt';

type AgentTokenMeta = {
    expires_at: string | null;
    issued_at?: string | null;
};

const AgentAuthContext = createContext<AgentAuthState | undefined>(undefined);

export function AgentAuthProvider({ children, initialMeta = null }: { children: React.ReactNode; initialMeta?: AgentTokenMeta | null }) {
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
            return stored;
        }

        return null;
    });
    const [expiresAt, setExpiresAt] = useState<string | null>(() => {
        if (typeof window === 'undefined') {
            return initialMeta?.expires_at ?? null;
        }

        const stored = window.localStorage.getItem(storageExpiryKey);
        if (stored) {
            return stored;
        }

        return initialMeta?.expires_at ?? null;
    });
    const [issuedAt, setIssuedAt] = useState<string | null>(() => {
        if (typeof window === 'undefined') {
            return initialMeta?.issued_at ?? null;
        }

        const stored = window.localStorage.getItem(storageIssuedAtKey);
        if (stored) {
            return stored;
        }

        return initialMeta?.issued_at ?? null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (token) {
            window.localStorage.setItem(storageKey, token);
        } else {
            window.localStorage.removeItem(storageKey);
        }
    }, [token]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (expiresAt) {
            window.localStorage.setItem(storageExpiryKey, expiresAt);
        } else {
            window.localStorage.removeItem(storageExpiryKey);
        }
    }, [expiresAt]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (issuedAt) {
            window.localStorage.setItem(storageIssuedAtKey, issuedAt);
        } else {
            window.localStorage.removeItem(storageIssuedAtKey);
        }
    }, [issuedAt]);

    const hydrateFromMeta = useCallback((meta: AgentTokenMeta | null | undefined) => {
        if (!meta) {
            return;
        }

        setExpiresAt((previous) => {
            if (!meta.expires_at) {
                return previous;
            }

            if (previous === meta.expires_at) {
                return previous;
            }

            window.localStorage.setItem(storageExpiryKey, meta.expires_at);

            return meta.expires_at;
        });

        setIssuedAt((previous) => {
            if (!meta.issued_at) {
                return previous;
            }

            if (previous === meta.issued_at) {
                return previous;
            }

            window.localStorage.setItem(storageIssuedAtKey, meta.issued_at);

            return meta.issued_at;
        });
    }, []);

    useEffect(() => {
        hydrateFromMeta(initialMeta);
    }, [initialMeta, hydrateFromMeta]);

    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<{ page: { props: Record<string, unknown> } }>).detail;
            if (!detail?.page?.props) {
                return;
            }

            const props = detail.page.props as { agentToken?: AgentTokenMeta | null };
            hydrateFromMeta(props.agentToken ?? null);
        };

        document.addEventListener('inertia:success', handler as EventListener);

        return () => {
            document.removeEventListener('inertia:success', handler as EventListener);
        };
    }, [hydrateFromMeta]);

    const submit = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { url } = agentTokenRoute();
            const csrfToken = getCsrfToken();

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                credentials: 'include',
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload?.message ?? 'Failed to issue agent token.');
            }

            const payload = await response.json();

            setToken(payload.access_token ?? null);
            setExpiresAt(payload.expires_at ?? null);
            setIssuedAt(payload.issued_at ?? null);
            if (payload.expires_at) {
                window.localStorage.setItem(storageExpiryKey, payload.expires_at);
            }
            if (payload.issued_at) {
                window.localStorage.setItem(storageIssuedAtKey, payload.issued_at);
            }
            if (payload.access_token) {
                window.localStorage.setItem(storageKey, payload.access_token);
            }
        } catch (caught) {
            const err = caught as Error;
            setToken(null);
            setExpiresAt(null);
            setIssuedAt(null);
            setError(err.message);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(storageKey);
                window.localStorage.removeItem(storageExpiryKey);
                window.localStorage.removeItem(storageIssuedAtKey);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setToken(null);
        setExpiresAt(null);
        setIssuedAt(null);
        setError(null);
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(storageKey);
            window.localStorage.removeItem(storageExpiryKey);
            window.localStorage.removeItem(storageIssuedAtKey);
        }
    }, []);

    const value = useMemo<AgentAuthState>(() => ({
        token,
        expiresAt,
        issuedAt,
        loading,
        error,
        submit,
        clear,
    }), [token, expiresAt, issuedAt, loading, error, submit, clear]);

    return createElement(AgentAuthContext.Provider, { value }, children);
}

export function useAgentAuth(): AgentAuthState {
    const context = useContext(AgentAuthContext);

    if (!context) {
        throw new Error('useAgentAuth must be used within an AgentAuthProvider');
    }

    return context;
}
