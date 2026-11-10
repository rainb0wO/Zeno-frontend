import { apiGet, apiPost } from './http';
import { endpoints } from './endpoints';
import type { UserRole } from '../domain/roles';

export interface User {
  id: string;
  username: string;
  role: UserRole | string;
  factoryId?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginParams {
  account: string;
  password: string;
  deviceId?: string;
  deviceType?: 'WEB';
}

export interface RegisterParams {
  username: string;
  password: string;
  confirmPassword: string;
  factoryName: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  managementMode?: string;
}

export function readSession(body: { token?: unknown; user?: User }): AuthSession {
  if (typeof body.token !== 'string' || !body.user) {
    throw new Error('登录响应缺少 token 或 user');
  }
  const token = body.token.startsWith('Bearer ') ? body.token.slice(7) : body.token;
  return { token, user: body.user };
}

const DEVICE_KEY = 'zeno_device_id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export const authApi = {
  login: async (params: LoginParams) => {
    const result = await apiPost<{ token: string; user: User }>(endpoints.login, {
      account: params.account,
      password: params.password,
      deviceId: params.deviceId ?? getDeviceId(),
      deviceType: params.deviceType ?? 'WEB',
    }, { skipErrorToast: true });
    return { message: result.message, ...readSession(result) };
  },

  register: async (params: RegisterParams) => {
    const result = await apiPost<{ token: string; user: User }>(endpoints.register, params, { skipErrorToast: true });
    return { message: result.message, ...readSession(result) };
  },

  me: async () => {
    const result = await apiGet<{ user: User }>(endpoints.me);
    if (!result.user) throw new Error('响应缺少 user');
    return result.user;
  },

  switchFactory: async (factoryId: string) => {
    const result = await apiPost<{ user: User }>(endpoints.switchFactory, { factoryId });
    if (!result.user?.factoryId) throw new Error('响应缺少 user.factoryId');
    return { message: result.message, user: result.user, factoryId: result.user.factoryId };
  },

  logout: async () => {
    try {
      await apiPost<{ tokenRevoked: boolean }>(endpoints.logout, { deviceId: getDeviceId() }, {
        skipErrorToast: true,
        skipAuthRedirect: true,
      });
    } catch {
      // 接口失败也要清掉本地登录态。
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};
