import request from './request';

// 工序相关接口
export interface ProcessStep {
  name: string;
  equipment?: string;
  standardTime?: number;
  qualityRequirement?: string;
  description?: string;
}

export interface Process extends ProcessStep {
  id: string;
  planId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateProcessParams {
  clothingType: string;
  craftType: string;
  material: string;
}

export interface CreateProcessesParams {
  planId: string;
  processes: ProcessStep[];
}

export interface UpdateProcessParams {
  name?: string;
  sortOrder?: number;
  equipment?: string;
  standardTime?: number;
  qualityRequirement?: string;
  description?: string;
}

export interface TemplateOptions {
  clothingTypes: string[];
  craftTypes: string[];
  materials: string[];
}

export interface ProcessTemplate {
  id: string;
  name: string;
  clothingType: string;
  craftType: string;
  material: string;
  processes: ProcessStep[];
  source?: 'PRESET' | 'AI_GENERATED' | 'MANUAL';
  createdAt?: string;
}

export interface TemplatesData {
  templates: ProcessTemplate[];
  grouped: Record<string, ProcessTemplate[]>;
}

// 获取工序模板选项
export const getTemplateOptions = () => {
  return request.get<TemplateOptions>('/processes/template-options');
};

// 生成工序名
export const generateProcesses = (params: GenerateProcessParams) => {
  return request.post<{ processes: ProcessStep[]; matched: boolean; source?: string }>('/processes/generate', params);
};

// 获取生产计划的工序列表
export const getProcessesByPlan = (planId: string) => {
  return request.get<Process[]>(`/processes/plan/${planId}`);
};

// 批量创建工序
export const createProcesses = (params: CreateProcessesParams) => {
  return request.post<{ count: number; processes: Process[] }>('/processes', params);
};

// 更新工序
export const updateProcess = (id: string, params: UpdateProcessParams) => {
  return request.put<Process>(`/processes/${id}`, params);
};

// 删除工序
export const deleteProcess = (id: string) => {
  return request.delete(`/processes/${id}`);
};

// 获取所有模板
export const getTemplates = () => {
  return request.get<TemplatesData>('/processes/templates');
};

export const processApi = {
  getTemplateOptions,
  getTemplates,
  generateProcesses,
  getProcessesByPlan,
  createProcesses,
  updateProcess,
  deleteProcess
};
