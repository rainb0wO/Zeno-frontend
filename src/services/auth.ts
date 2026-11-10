import { apiGet, apiPost } from './http';
import { endpoints } from './endpoints';
import type { UserRole } from '../domain/roles';

export interface User {
  id: string;
  username: string;
  role: UserRole | string;
  factoryId?: string | null;
  phone?: string | null;
  createdAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  factoryName: string;
  phone?: string;
}

function readSession(data: unknown): AuthSession {
  const body = (data && typeof data === 'object' ? data : {}) as { token?: unknown; user?: User };
  if (typeof body.token !== 'string' || !body.user) {
    throw new Error('登录响应缺少 token 或用户信息');
  }
  const token = body.token.startsWith('Bearer ') ? body.token.slice(7) : body.token;
  return { token, user: body.user };
}

export const authApi = {
  login: async (params: LoginParams) => {
    const result = await apiPost<unknown>(endpoints.login, params, { skipErrorToast: true });
    return { message: result.message, ...readSession(result.data) };
  },

  register: async (params: RegisterParams) => {
    const result = await apiPost<unknown>(endpoints.register, params, { skipErrorToast: true });
    return { message: result.message, ...readSession(result.data) };
  },

  me: async () => {
    const result = await apiGet<{ user: User } | User>(endpoints.me);
    const data = result.data;
    const user = data && typeof data === 'object' && 'user' in data ? data.user : data as User;
    return user;
  },

  switchFactory: async (factoryId: string) => {
    const result = await apiPost<{ user?: User; factoryId?: string }>(endpoints.switchFactory, { factoryId });
    return { message: result.message, user: result.data?.user, factoryId: result.data?.factoryId || result.data?.user?.factoryId || factoryId };
  },

  logout: async () => {
    try {
      await apiPost(endpoints.logout, {}, { skipErrorToast: true, skipAuthRedirect: true });
    } catch {
      // 本地会话仍要清掉，避免登出接口失败时把人留在已登录界面。
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};
