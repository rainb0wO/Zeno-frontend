import { get, post, put, del } from './request';

// 物流记录类型
export interface LogisticsRecord {
  id: string;
  factoryId: string;
  type: 'INBOUND' | 'OUTBOUND';
  productName: string;
  quantity: number;
  destination: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// 库存记录类型
export interface InventoryRecord {
  id: string;
  factoryId: string;
  materialName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unit: string;
  date: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// 创建物流记录参数
export interface CreateLogisticsParams {
  factoryId: string;
  type: 'INBOUND' | 'OUTBOUND';
  productName: string;
  quantity: number;
  destination: string;
  status?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
}

// 创建库存记录参数
export interface CreateInventoryParams {
  factoryId: string;
  materialName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unit: string;
  date: string;
  remark: string;
}

// 物流管理API
export const logisticsApi = {
  // 获取物流记录列表
  getLogisticsRecords: (params?: {
    factoryId?: string;
    type?: string;
    status?: string;
  }): Promise<{ logisticsRecords: LogisticsRecord[] }> => {
    return get<{ logisticsRecords: LogisticsRecord[] }>('/logistics', params);
  },

  // 获取物流记录详情
  getLogisticsRecordById: (id: string): Promise<{ logisticsRecord: LogisticsRecord }> => {
    return get<{ logisticsRecord: LogisticsRecord }>(`/logistics/${id}`);
  },

  // 创建物流记录
  createLogisticsRecord: (params: CreateLogisticsParams): Promise<{ message: string; logisticsRecord: LogisticsRecord }> => {
    return post<{ message: string; logisticsRecord: LogisticsRecord }>('/logistics', params);
  },

  // 更新物流记录
  updateLogisticsRecord: (id: string, params: Partial<CreateLogisticsParams>): Promise<{ message: string; logisticsRecord: LogisticsRecord }> => {
    return put<{ message: string; logisticsRecord: LogisticsRecord }>(`/logistics/${id}`, params);
  },

  // 删除物流记录
  deleteLogisticsRecord: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/logistics/${id}`);
  },

  // 获取库存记录列表
  getInventoryRecords: (params?: {
    factoryId?: string;
    materialName?: string;
    type?: string;
  }): Promise<{ inventoryRecords: InventoryRecord[] }> => {
    return get<{ inventoryRecords: InventoryRecord[] }>('/logistics/inventory', params);
  },

  // 创建库存记录
  createInventoryRecord: (params: CreateInventoryParams): Promise<{ message: string; inventoryRecord: InventoryRecord }> => {
    return post<{ message: string; inventoryRecord: InventoryRecord }>('/logistics/inventory', params);
  },

  // 获取物流统计数据
  getLogisticsStats: (params?: {
    factoryId?: string;
  }): Promise<{ 
    totalRecords: number;
    deliveredRecords: number;
    inTransitRecords: number;
    pendingRecords: number;
    inboundRecords: number;
    outboundRecords: number;
  }> => {
    return get<{ 
      totalRecords: number;
      deliveredRecords: number;
      inTransitRecords: number;
      pendingRecords: number;
      inboundRecords: number;
      outboundRecords: number;
    }>('/logistics/stats/summary', params);
  },
};

export default logisticsApi;
