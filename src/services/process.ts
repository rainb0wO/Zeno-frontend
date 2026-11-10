import { readNamedList } from '../domain/apiEnvelope';
import { apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export interface ProcessStep {
  name: string;
  equipment?: string;
  standardTime?: number;
  description?: string;
}

export interface ProcessRecord extends ProcessStep {
  id: string;
  planId?: string;
  sortOrder?: number;
}

export interface GenerateProcessInput {
  clothingType: string;
  craftType: string;
  material: string;
  planId?: string;
}

export const processApi = {
  listByPlan: async (planId: string) => {
    const result = await apiGet<unknown>(endpoints.planProcesses(planId));
    return readNamedList<ProcessRecord>(result.data, 'processes');
  },

  generate: async (input: GenerateProcessInput) => {
    const result = await apiPost<unknown>(endpoints.generateProcesses, input);
    return readNamedList<ProcessStep>(result.data, 'processes');
  },

  save: async (planId: string, processes: ProcessStep[]) => {
    const result = await apiPost<unknown>(endpoints.processes, { planId, processes });
    return { message: result.message, processes: readNamedList<ProcessRecord>(result.data, 'processes') };
  },

  update: async (id: string, input: ProcessStep) => {
    const result = await apiPut<unknown>(endpoints.process(id), input);
    return result.message;
  },
};
