import axios, { AxiosError } from 'axios';

import type { ApiFailure } from '@/types/api';

export const api = axios.create({
    baseURL: '/',
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    withCredentials: true,
    withXSRFToken: true,
});

export function getApiErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const response = error.response?.data as ApiFailure | undefined;
        return response?.message ?? 'The request could not be completed.';
    }

    return 'An unexpected error occurred.';
}
