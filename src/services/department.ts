import { readNamedList } from '../domain/apiEnvelope';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export interface Department {
  id: string;
  name: string;
  factoryId?: string;
  parentId?: string | null;
  status?: number;
  employeeCount?: number;
  children?: Department[];
}

export interface DepartmentInput {
  name: string;
  factoryId: string;
  parentId?: string | null;
}

export const departmentApi = {
  list: async (factoryId: string) => {
    const result = await apiGet<unknown>(endpoints.departments, { factoryId });
    return readNamedList<Department>(result.data, 'departments');
  },

  create: async (input: DepartmentInput) => {
    const result = await apiPost<unknown>(endpoints.departments, input);
    return result.message;
  },

  update: async (id: string, input: { name: string; parentId?: string | null }) => {
    const result = await apiPut<unknown>(endpoints.department(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete<unknown>(endpoints.department(id));
    return result.message;
  },
};
