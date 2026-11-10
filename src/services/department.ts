import { requireList } from '../domain/apiEnvelope';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export interface Department {
  id: string;
  name: string;
  factoryId?: string;
  parentId?: string | null;
  leaderId?: string | null;
  status?: number;
  employeeCount?: number;
  children?: Department[];
}

export interface DepartmentInput {
  name: string;
  parentId?: string | null;
  leaderId?: string | null;
  status?: number;
}

export const departmentApi = {
  list: async () => {
    const result = await apiGet<{ departments: Department[]; total: number }>(endpoints.departments);
    return requireList<Department>(result, 'departments');
  },

  create: async (input: DepartmentInput) => {
    const result = await apiPost(endpoints.departments, {
      name: input.name,
      parentId: input.parentId ?? null,
      leaderId: input.leaderId ?? null,
      status: input.status ?? 1,
    });
    return result.message;
  },

  update: async (id: string, input: DepartmentInput) => {
    const result = await apiPut(endpoints.department(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete(endpoints.department(id));
    return result.message;
  },
};
