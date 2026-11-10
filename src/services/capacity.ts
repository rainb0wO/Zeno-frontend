import { requireList } from '../domain/apiEnvelope';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export type PlanStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface ProductionPlan {
  id: string;
  productName: string;
  targetQty: number;
  actualQty?: number;
  progress?: number;
  startDate: string;
  endDate: string;
  status?: PlanStatus;
  clothingType?: string | null;
  craftType?: string | null;
  material?: string | null;
}

export interface PlanInput {
  productName: string;
  targetQty: number;
  startDate: string;
  endDate: string;
  status?: PlanStatus;
  clothingType?: string;
  craftType?: string;
  material?: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '待开始',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  DELAYED: '延期',
};

export function planStatusLabel(status?: string): string {
  if (!status) return '未设置';
  return STATUS_LABEL[status] || status;
}

export const capacityApi = {
  list: async () => {
    const result = await apiGet<{ productionPlans: ProductionPlan[] }>(endpoints.plans);
    return requireList<ProductionPlan>(result, 'productionPlans');
  },

  get: async (id: string) => {
    const result = await apiGet<{ productionPlan: ProductionPlan }>(endpoints.plan(id));
    if (!result.productionPlan) throw new Error('响应缺少 productionPlan');
    return result.productionPlan;
  },

  create: async (input: PlanInput) => {
    const result = await apiPost<{ productionPlan: ProductionPlan }>(endpoints.plans, input);
    if (!result.productionPlan) throw new Error('响应缺少 productionPlan');
    return { message: result.message, plan: result.productionPlan };
  },

  update: async (id: string, input: Partial<PlanInput>) => {
    const result = await apiPut(endpoints.plan(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete(endpoints.plan(id));
    return result.message;
  },
};
