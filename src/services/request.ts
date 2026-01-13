import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

// API基础URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true, // 发送cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: any) => {
    // 从 localStorage 获取 token，但登录请求不需要携带 token
    if (!config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
      const token = localStorage.getItem('token');
      console.log('请求拦截器 - URL:', config.url);
      console.log('请求拦截器 - Token 是否存在:', !!token);
      console.log('请求拦截器 - Token 值:', token ? token.substring(0, 30) + '...' : 'null');
      
      if (token) {
        // 确保 token 不包含 "Bearer " 前缀（防止重复添加）
        const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${cleanToken}`;
        // 调试日志
        console.log('请求拦截器 - 已添加 Authorization 头:', config.headers.Authorization.substring(0, 40) + '...');
      } else {
        console.warn('请求拦截器 - 未找到 token，无法添加 Authorization 头:', config.url);
      }
    } else {
      console.log('请求拦截器 - 登录/注册请求，跳过 token:', config.url);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse): any => {
    // 仅在开发环境显示详细日志
    if (import.meta.env.DEV) {
      console.log('响应:', response.config.url, response.status);
    }
    const { data } = response;
    
    // 如果响应中包含 token，保存到 localStorage（确保不包含 Bearer 前缀）
    if (data.token) {
      // 移除可能存在的 "Bearer " 前缀，只保存纯 token
      const cleanToken = data.token.startsWith('Bearer ') ? data.token.substring(7) : data.token;
      localStorage.setItem('token', cleanToken);
      console.log('Token 已保存:', cleanToken.substring(0, 20) + '...');
    }
    
    // 返回 data 对象，保持与业务代码一致
    return data;
  },
  (error: AxiosError) => {
    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response as any;
      
      switch (status) {
        case 401:
          message.error('未授权，请重新登录');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          break;
        case 403:
          message.error('权限不足，无法访问该资源');
          break;
        case 404:
          console.error('404错误:', error.config?.url);
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误，请稍后重试');
          break;
        default:
          if (data?.message) {
            message.error(data.message);
          } else {
            message.error('请求失败，请稍后重试');
          }
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络设置');
    } else {
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

// 封装GET请求
export const get = <T = any>(url: string, params?: any, config?: AxiosRequestConfig<any>): Promise<T> => {
  return request.get(url, { params, ...config });
};

// 封装POST请求
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<T> => {
  return request.post(url, data, config);
};

// 封装PUT请求
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<T> => {
  return request.put(url, data, config);
};

// 封装DELETE请求
export const del = <T = any>(url: string, config?: AxiosRequestConfig<any>): Promise<T> => {
  return request.delete(url, config);
};

// 封装PATCH请求
export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<T> => {
  return request.patch(url, data, config);
};

export default request;
