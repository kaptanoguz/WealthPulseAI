// ============================================================
// WealthPulse AI — API Client
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;

    try {
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        const data = await res.json();

        return {
            data,
            status: res.status,
            message: res.ok ? undefined : data.message || 'An error occurred',
        };
    } catch {
        return {
            data: null as unknown as T,
            status: 500,
            message: 'Network error — could not reach server',
        };
    }
}

export const api = {
    get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: unknown) =>
        apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown) =>
        apiFetch<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),
};
