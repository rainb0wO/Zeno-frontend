import { get, post } from './request';

// 用户信息类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  factoryId?: string;
  createdAt: string;
}

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
}

// 注册参数
export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 登录响应
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// 注册响应
export interface RegisterResponse {
  message: string;
  user: User;
  token: string; // 注册成功后返回token以便自动登录
}

// 认证API
export const authApi = {
  // 获取验证码（返回完整URL）
  getCaptcha: (): string => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
    return `${BASE_URL}/auth/captcha?t=${Date.now()}`;
  },

  // 用户登录
  login: (params: LoginParams): Promise<LoginResponse> => {
    return post<LoginResponse>('/auth/login', params);
  },

  // 用户注册
  register: (params: RegisterParams): Promise<RegisterResponse> => {
    return post<RegisterResponse>('/auth/register', params);
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<{ user: User }> => {
    return get<{ user: User }>('/auth/me');
  },

  // 退出登录
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

export default authApi;
