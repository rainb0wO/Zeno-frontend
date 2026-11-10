import { readNamedList } from '../domain/apiEnvelope';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export interface ProductionPlan {
  id: string;
  factoryId?: string;
  productName: string;
  targetQty: number;
  actualQty?: number;
  startDate: string;
  endDate: string;
  status?: string;
  clothingType?: string | null;
  craftType?: string | null;
  material?: string | null;
}

export interface PlanInput {
  productName: string;
  targetQty: number;
  startDate: string;
  endDate: string;
  factoryId: string;
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

function readPlan(data: unknown): ProductionPlan {
  const body = (data && typeof data === 'object' ? data : {}) as { plan?: ProductionPlan; productionPlan?: ProductionPlan };
  return body.plan || body.productionPlan || (data as ProductionPlan);
}

export const capacityApi = {
  list: async (factoryId?: string) => {
    const result = await apiGet<unknown>(endpoints.plans, factoryId ? { factoryId } : undefined);
    return readNamedList<ProductionPlan>(result.data, 'plans').length
      ? readNamedList<ProductionPlan>(result.data, 'plans')
      : readNamedList<ProductionPlan>(result.data, 'productionPlans');
  },

  get: async (id: string) => {
    const result = await apiGet<unknown>(endpoints.plan(id));
    return readPlan(result.data);
  },

  create: async (input: PlanInput) => {
    const result = await apiPost<unknown>(endpoints.plans, input);
    return { message: result.message, plan: readPlan(result.data) };
  },

  update: async (id: string, input: Partial<PlanInput>) => {
    const result = await apiPut<unknown>(endpoints.plan(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete<unknown>(endpoints.plan(id));
    return result.message;
  },
};
