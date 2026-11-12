import { apiPost } from './http';
import { endpoints } from './endpoints';

export interface AssistantOption {
  type: 'employee' | 'group';
  id: string;
  name: string;
  groupName?: string;
}

export interface AssistantChatResponse {
  code: number;
  message: string;
  intent: string;
  answer: string;
  data?: Record<string, unknown>;
  suggestions?: string[];
  options?: AssistantOption[];
  degraded?: boolean;
}

/**
 * AI 小助手（第二阶段第 3 步，只读查询 + 查缺，不做录入）。
 * JWT 由 http 客户端自动从 localStorage 带上（有则定身份，无则按匿名处理）。
 */
export const assistantApi = {
  chat: async (input: {
    token: string;
    groupId?: string;
    date?: string;
    message: string;
  }): Promise<AssistantChatResponse> => {
    const result = await apiPost<AssistantChatResponse>(endpoints.assistantChat, input, {
      skipErrorToast: true,
      skipAuthRedirect: true,
    });
    return result;
  },
};
