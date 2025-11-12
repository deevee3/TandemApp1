import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getCsrfToken(): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    if (meta?.content) {
        return meta.content;
    }

    const cookie = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return cookie ? decodeURIComponent(cookie[1]) : null;
}
