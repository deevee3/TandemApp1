import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    agentToken?: {
        expires_at: string | null;
    } | null;
    [key: string]: unknown;
}

export interface LatestMessageSummary {
    id: number;
    sender_type: string;
    content: string;
    confidence?: number | null;
    metadata?: Record<string, unknown> | null;
    created_at: string | null;
}

export interface ConversationSummary {
    id: number;
    subject: string | null;
    status: string;
    priority: string;
    last_activity_at: string | null;
    requester: {
        type: string | null;
        identifier: string | null;
    };
    latest_message: LatestMessageSummary | null;
}

export interface ConversationDetail extends ConversationSummary {
    metadata: Record<string, unknown> | null;
}

export interface QueueItemPayload {
    id: number;
    queue_id: number;
    state: string;
    enqueued_at: string | null;
    dequeued_at: string | null;
    metadata: Record<string, unknown> | null;
    conversation: ConversationSummary | null;
}

export interface ConversationMessage {
    id: number;
    sender_type: string;
    content: string;
    confidence?: number | null;
    metadata?: Record<string, unknown> | null;
    created_at: string | null;
    user: {
        id: number;
        name: string | null;
    } | null;
}

export interface ConversationQueueItem extends QueueItemPayload {
    queue?: {
        id: number;
        name: string;
    } | null;
}

export interface ConversationAssignment {
    id: number;
    status: string;
    assigned_at: string | null;
    accepted_at: string | null;
    released_at: string | null;
    resolved_at: string | null;
    metadata: Record<string, unknown> | null;
    user: {
        id: number;
        name: string | null;
    } | null;
    queue: {
        id: number;
        name: string | null;
    } | null;
}

export interface ConversationHandoff {
    id: number;
    reason_code: string;
    confidence?: number | null;
    policy_hits?: Record<string, unknown> | null;
    required_skills?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
    created_at: string | null;
}

export interface PaginatedQueueItemsResponse {
    data: QueueItemPayload[];
    meta: {
        pagination: {
            current_page: number;
            per_page: number;
            total: number;
            last_page: number;
        };
        filters: {
            state: string | null;
        };
    };
}

export interface QueueSummary {
    id: number;
    name: string;
    is_default?: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

declare module '*.png' {
    const src: string;
    export default src;
}
