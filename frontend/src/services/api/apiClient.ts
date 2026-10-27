import { ApiResponse } from '../../types';

const BASE_URL = '/api/v1';

export class ApiError extends Error {
  code?: string;
  details?: any;
  statusCode?: number;

  constructor(message: string, code?: string, details?: any, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // As required: credentials enabled for HttpOnly cookie session
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        `Server returned ${response.status} ${response.statusText}`,
        'SERVER_ERROR',
        null,
        response.status
      );
    }
    throw new ApiError('Failed to parse server response.', 'PARSE_ERROR');
  }

  if (!data.success) {
    const errorMsg = (data as any).message || data.error?.message || 'Request failed';
    throw new ApiError(errorMsg, data.error?.code, data.error?.details, response.status);
  }

  return data.data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    }),

  delete: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
      ...options
    })
};

export default api;
