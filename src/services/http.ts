import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { ApiError, unwrapEnvelope, type ApiSuccess } from '../domain/apiEnvelope';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface RequestOptions extends AxiosRequestConfig {
  skipErrorToast?: boolean;
  skipAuthRedirect?: boolean;
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

function isPublicAuth(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/register');
}

function isGroupEntry(url: string): boolean {
  return url.includes('group-entry');
}

client.interceptors.request.use((config) => {
  const url = `${config.baseURL || ''}${config.url || ''}`;
  if (!isPublicAuth(url)) {
    const token = localStorage.getItem('token');
    if (token) {
      const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
      config.headers.set('Authorization', `Bearer ${clean}`);
    }
  }
  return config;
});

function redirectToLogin() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ code?: number; message?: string }>) => {
    const config = error.config as RequestOptions | undefined;
    const url = `${config?.baseURL || ''}${config?.url || ''}`;
    const status = error.response?.status;
    const payload = error.response?.data;
    const text = payload?.message || (status === 401 ? '未授权，请重新登录' : '请求失败，请稍后重试');
    const apiError = new ApiError(text, Number(payload?.code ?? status ?? -1), status);

    if (status === 401 && !config?.skipAuthRedirect && !isGroupEntry(url) && !isPublicAuth(url)) {
      message.error('登录已过期，请重新登录');
      redirectToLogin();
    } else if (!config?.skipErrorToast) {
      message.error(apiError.message);
    }
    return Promise.reject(apiError);
  },
);

async function send<T>(options: RequestOptions): Promise<ApiSuccess<T>> {
  try {
    const response = await client.request(options);
    return unwrapEnvelope<T>(response.data);
  } catch (error) {
    if (error instanceof ApiError) {
      if (!options.skipErrorToast && error.status === undefined) {
        message.error(error.message);
      }
      throw error;
    }
    throw error;
  }
}

export function apiGet<T>(url: string, params?: object, options?: RequestOptions) {
  return send<T>({ ...options, url, method: 'GET', params });
}

export function apiPost<T>(url: string, data?: unknown, options?: RequestOptions) {
  return send<T>({ ...options, url, method: 'POST', data });
}

export function apiPut<T>(url: string, data?: unknown, options?: RequestOptions) {
  return send<T>({ ...options, url, method: 'PUT', data });
}

export function apiDelete<T>(url: string, options?: RequestOptions) {
  return send<T>({ ...options, url, method: 'DELETE' });
}
