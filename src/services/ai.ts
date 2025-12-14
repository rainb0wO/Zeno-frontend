import { get, post, put } from './request';

// AI 配置接口
export interface AIConfig {
  provider: 'deepseek' | 'doubao' | 'qwen' | 'custom';
  apiKey: string;
  apiUrl: string;
  enabled: boolean;
}

// AI 提供商接口
export interface AIProvider {
  value: string;
  label: string;
  defaultUrl: string;
  model: string;
  keyGuide: string;
}

// AI 服务 API
export const aiApi = {
  // 获取 AI 配置
  getConfig: (): Promise<{ config: AIConfig }> => {
    return get<{ config: AIConfig }>('/ai/config');
  },

  // 更新 AI 配置
  updateConfig: (config: Partial<AIConfig>) => {
    return put('/ai/config', config);
  },

  // 测试 AI 连接
  testConnection: (config: { provider: string; apiKey: string; apiUrl: string }): Promise<{ success: boolean; message: string }> => {
    return post<{ success: boolean; message: string }>('/ai/test', config);
  },

  // 获取 AI 提供商列表
  getProviders: (): Promise<{ providers: AIProvider[] }> => {
    return get<{ providers: AIProvider[] }>('/ai/providers');
  },

  // 使用 AI 生成工序
  generateProcesses: (data: { clothingType: string; craftType: string; material: string }) => {
    return post('/ai/generate', data);
  }
};
