import { requireList } from '../domain/apiEnvelope';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export interface ProcessStep {
  name: string;
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
}

export interface GeneratedProcesses {
  processes: ProcessStep[];
  matched: boolean;
  source: string;
  message: string;
}

export const processApi = {
  listByPlan: async (planId: string) => {
    const result = await apiGet<{ processes: ProcessRecord[] }>(endpoints.planProcesses(planId));
    return requireList<ProcessRecord>(result, 'processes');
  },

  generate: async (input: GenerateProcessInput): Promise<GeneratedProcesses> => {
    const result = await apiPost<{ processes: ProcessStep[]; matched: boolean; source: string }>(
      endpoints.generateProcesses,
      input,
    );
    return {
      message: result.message,
      processes: requireList<ProcessStep>(result, 'processes'),
      matched: result.matched === true,
      source: result.source,
    };
  },

  save: async (planId: string, processes: ProcessStep[]) => {
    const result = await apiPost<{ count: number; processes: ProcessRecord[] }>(endpoints.processes, {
      planId,
      processes,
    });
    return { message: result.message, count: result.count, processes: requireList<ProcessRecord>(result, 'processes') };
  },

  update: async (id: string, input: ProcessStep) => {
    const result = await apiPut(endpoints.process(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete(endpoints.process(id));
    return result.message;
  },
};
