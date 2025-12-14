import request from './request';

// 计件记录接口
export interface PieceWork {
  id: string;
  planId: string;
  processId: string;
  employeeId: string;
  quantity: number;
  completedAt: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePieceWorkParams {
  planId: string;
  processId: string;
  employeeId: string;
  quantity: number;
  completedAt?: string;
  remark?: string;
}

export interface BatchPieceWorkParams {
  records: CreatePieceWorkParams[];
}

export interface PieceWorkTemplate {
  fields: Array<{
    key: string;
    label: string;
    required: boolean;
    type?: string;
  }>;
  planId: string;
}

export interface PieceWorkStatistics {
  employeeId?: string;
  processId?: string;
  totalQuantity: number;
  recordCount: number;
}

// 获取生产计划的计件记录
export const getPieceWorksByPlan = (planId: string) => {
  return request.get<PieceWork[]>(`/piece-works/plan/${planId}`);
};

// 创建计件记录
export const createPieceWork = (params: CreatePieceWorkParams) => {
  return request.post<PieceWork>('/piece-works', params);
};

// 批量创建计件记录
export const batchCreatePieceWorks = (params: BatchPieceWorkParams) => {
  return request.post<{ count: number }>('/piece-works/batch', params);
};

// 更新计件记录
export const updatePieceWork = (id: string, params: Partial<CreatePieceWorkParams>) => {
  return request.put<PieceWork>(`/piece-works/${id}`, params);
};

// 删除计件记录
export const deletePieceWork = (id: string) => {
  return request.delete(`/piece-works/${id}`);
};

// 生成计件表模板
export const generatePieceWorkTemplate = (planId: string) => {
  return request.get<PieceWorkTemplate>(`/piece-works/template/${planId}`);
};

// 获取计件统计
export const getPieceWorkStatistics = (planId: string, groupBy: 'employee' | 'process' = 'employee') => {
  return request.get<PieceWorkStatistics[]>(`/piece-works/statistics/${planId}?groupBy=${groupBy}`);
};

export const pieceWorkApi = {
  getPieceWorksByPlan,
  createPieceWork,
  batchCreatePieceWorks,
  updatePieceWork,
  deletePieceWork,
  generatePieceWorkTemplate,
  getPieceWorkStatistics
};
