import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(message, { status = 0, details = null, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.cause = cause;
  }
}


export async function fetchJson(path, { timeoutMs = 8000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
      ...options,
    });

   
    let data = null;
    try {
      data = await res.json();
    } catch {
      throw new ApiError('La respuesta del servidor no es JSON válido', { status: res.status });
    }
    if (!res.ok) {
      throw new ApiError(data?.error || `Error ${res.status}`, { status: res.status, details: data?.details });
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') throw new ApiError('El servidor tardó demasiado en responder', { cause: err });
    throw new ApiError('No se pudo conectar con el servidor', { cause: err });
  } finally {
    clearTimeout(timer);
  }
}


export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  withCredentials: true, 
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    if (status === 401 && typeof window !== 'undefined' && !error.config?.url?.includes('/api/auth/login')) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    let message = data?.error;
    if (!message) {
      if (error.code === 'ECONNABORTED') message = 'El servidor tardó demasiado en responder';
      else if (!error.response) message = 'No se pudo conectar con el servidor';
      else message = `Error ${status}`;
    }
    return Promise.reject(new ApiError(message, { status, details: data?.details, cause: error }));
  }
);
