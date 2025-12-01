import { useEffect, useMemo, useState } from 'react';

import Api from '@/actions/App/Http/Controllers/Api';
import { type PaginatedQueueItemsResponse, type QueueItemPayload } from '@/types';
import { useAgentAuthToken } from '@/hooks/use-agent-auth';
import { useAgentAuth } from '@/lib/agent-auth';

export function createQueueItemsHeaders(token?: string | null, apiKey?: string): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else if (apiKey) {
        headers['X-Api-Key'] = apiKey;
    }

    return headers;
}

type QueueItemFilters = {
    state?: string | null;
    page?: number;
    perPage?: number;
};

type UseQueueItemsOptions = QueueItemFilters & {
    queueId: number;
    apiKey?: string;
};

type UseQueueItemsResult = {
    items: QueueItemPayload[];
    loading: boolean;
    error: string | null;
    pagination: PaginatedQueueItemsResponse['meta']['pagination'];
    filters: PaginatedQueueItemsResponse['meta']['filters'];
    refresh: () => Promise<void>;
};

const defaultPagination: PaginatedQueueItemsResponse['meta']['pagination'] = {
    current_page: 1,
    per_page: 50,
    total: 0,
    last_page: 1,
};

const defaultFilters: PaginatedQueueItemsResponse['meta']['filters'] = {
    state: null,
};

export function useQueueItems({ queueId, state, page = 1, perPage = 25, apiKey }: UseQueueItemsOptions): UseQueueItemsResult {
    const [items, setItems] = useState<QueueItemPayload[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState(defaultPagination);
    const [filters, setFilters] = useState(defaultFilters);

    const authToken = useAgentAuthToken();
    const { clear } = useAgentAuth();

    const headers = useMemo(() => createQueueItemsHeaders(authToken, apiKey), [authToken, apiKey]);

    const refresh = async () => {
        if (queueId <= 0) {
            setItems([]);
            setPagination(defaultPagination);
            setFilters(defaultFilters);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let url = '';

            if (state === 'bot_active') {
                url = '/api/conversations/bot-active';
            } else {
                const route = Api.QueueItemController.index({
                    queue: queueId,
                });
                url = route.url;
            }

            const query = new URLSearchParams();
            query.set('page', page.toString());
            query.set('per_page', perPage.toString());

            if (state && state !== 'bot_active') {
                query.set('state', state);
            }

            const response = await fetch(`${url}?${query.toString()}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    clear();
                    setError('Agent token invalid or expired. Generate a new token to continue.');
                    return;
                }

                setError('Failed to load queue items');
                return;
            }

            const payload = (await response.json()) as PaginatedQueueItemsResponse;

            setItems(payload.data);
            setPagination(payload.meta.pagination);
            setFilters(payload.meta.filters);
            setError(null);
        } catch (caught) {
            setError((caught as Error).message ?? 'Failed to load queue items');
            setItems([]);
            setPagination(defaultPagination);
            setFilters(defaultFilters);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void refresh();
    }, [queueId, state, page, perPage, headers]);

    return {
        items,
        loading,
        error,
        pagination,
        filters,
        refresh,
    };
}
