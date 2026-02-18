// ─── API client (base HTTP layer) ─────────────────────────────────────────────
// Throws on non-2xx responses. No retry logic — that belongs to offlineQueue.ts.

const API_PATH = process.env.API_PATH ?? '/api';

export interface ApiClientError extends Error {
  statusCode: number;
  code: string;
}

function createApiClientError(message: string, statusCode: number, code: string): ApiClientError {
  const error = new Error(message) as ApiClientError;
  error.name = 'ApiClientError';
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${API_PATH}${path}`;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const payload = await res.json().catch(() => ({
      code: 'UNKNOWN_ERROR',
      message: res.statusText,
    })) as { code?: string; message?: string };
    throw createApiClientError(
      payload.message ?? res.statusText,
      res.status,
      payload.code ?? 'UNKNOWN_ERROR'
    );
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path);
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>('POST', path, body);
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>('PUT', path, body);
  },
  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>('PATCH', path, body);
  },
  delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path);
  },
};
