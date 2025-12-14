import { get, post, put, del } from './request';

// 生产计划类型
export interface ProductionPlan {
  id: string;
  factoryId: string;
  productName: string;
  targetQty: number;
  actualQty?: number;
  progress?: number;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  createdAt: string;
  updatedAt: string;
}

// 生产记录类型
export interface ProductionRecord {
  id: string;
  productionPlanId: string;
  employeeId: string;
  date: string;
  actualQty: number;
  createdAt: string;
  updatedAt: string;
}

// 产能统计类型
export interface CapacityStatistics {
  totalPlans: number;
  completedPlans: number;
  inProgressPlans: number;
  totalTargetQty: number;
  totalActualQty: number;
  capacityUtilization: number;
}

// 创建生产计划参数
export interface CreateProductionPlanParams {
  productName: string;
  targetQty: number;
  startDate: string;
  endDate: string;
  factoryId: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

// 更新生产计划参数
export interface UpdateProductionPlanParams {
  productName?: string;
  targetQty?: number;
  startDate?: string;
  endDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

// 创建生产记录参数
export interface CreateProductionRecordParams {
  productionPlanId: string;
  employeeId: string;
  date: string;
  actualQty: number;
}

// 产能管理API
export const capacityApi = {
  // 获取生产计划列表
  getProductionPlans: (params?: {
    factoryId?: string;
    status?: string;
    dateRange?: string;
  }): Promise<any> => {
    return get<any>('/capacity/production-plans', params);
  },

  // 获取生产计划详情
  getProductionPlanById: (id: string): Promise<any> => {
    return get<any>(`/capacity/production-plans/${id}`);
  },

  // 创建生产计划
  createProductionPlan: (params: CreateProductionPlanParams): Promise<any> => {
    return post<any>('/capacity/production-plans', params);
  },

  // 更新生产计划
  updateProductionPlan: (id: string, params: UpdateProductionPlanParams): Promise<any> => {
    return put<any>(`/capacity/production-plans/${id}`, params);
  },

  // 删除生产计划
  deleteProductionPlan: (id: string): Promise<any> => {
    return del<any>(`/capacity/production-plans/${id}`);
  },

  // 获取生产记录
  getProductionRecords: (params?: {
    productionPlanId?: string;
    employeeId?: string;
    date?: string;
  }): Promise<any> => {
    return get<any>('/capacity/production-records', params);
  },

  // 创建生产记录
  createProductionRecord: (params: CreateProductionRecordParams): Promise<any> => {
    return post<any>('/capacity/production-records', params);
  },

  // 更新生产记录
  updateProductionRecord: (id: string, params: { actualQty: number }): Promise<any> => {
    return put<any>(`/capacity/production-records/${id}`, params);
  },

  // 删除生产记录
  deleteProductionRecord: (id: string): Promise<any> => {
    return del<any>(`/capacity/production-records/${id}`);
  },

  // 获取产能统计
  getCapacityStatistics: (params?: {
    factoryId?: string;
    dateRange?: string;
  }): Promise<any> => {
    return get<any>('/capacity/statistics', params);
  },
};

export default capacityApi;
