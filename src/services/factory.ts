import { get, post, put, del } from './request';

// 厂区信息类型
export interface Factory {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  managementMode: string;
  createdAt: string;
  updatedAt: string;
}

// 创建厂区参数
export interface CreateFactoryParams {
  name: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  managementMode: string;
}

// 更新厂区参数
export interface UpdateFactoryParams {
  name?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  managementMode?: string;
}

// 厂区API
export const factoryApi = {
  // 获取厂区列表
  getFactories: (): Promise<{ factories: Factory[] }> => {
    return get<{ factories: Factory[] }>('/factories');
  },

  // 获取厂区详情
  getFactoryById: (id: string): Promise<{ factory: Factory }> => {
    return get<{ factory: Factory }>(`/factories/${id}`);
  },

  // 创建厂区
  createFactory: (params: CreateFactoryParams): Promise<{ message: string; factory: Factory }> => {
    return post<{ message: string; factory: Factory }>('/factories', params);
  },

  // 更新厂区
  updateFactory: (id: string, params: UpdateFactoryParams): Promise<{ message: string; factory: Factory }> => {
    return put<{ message: string; factory: Factory }>(`/factories/${id}`, params);
  },

  // 删除厂区
  deleteFactory: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/factories/${id}`);
  },
};

export default factoryApi;
