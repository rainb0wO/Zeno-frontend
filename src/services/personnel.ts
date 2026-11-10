import { readNamedList } from '../domain/apiEnvelope';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export interface Employee {
  id: string;
  name: string;
  phone?: string | null;
  employeeNo?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  position?: string | null;
  factoryId?: string | null;
}

export interface EmployeeInput {
  name: string;
  phone?: string;
  departmentId?: string | null;
  position?: string;
  factoryId?: string;
}

function readEmployee(data: unknown): Employee {
  const body = (data && typeof data === 'object' ? data : {}) as { employee?: Employee };
  return body.employee || (data as Employee);
}

export const personnelApi = {
  list: async (factoryId?: string) => {
    const result = await apiGet<unknown>(endpoints.employees, factoryId ? { factoryId } : undefined);
    return readNamedList<Employee>(result.data, 'employees');
  },

  get: async (id: string) => {
    const result = await apiGet<unknown>(endpoints.employee(id));
    return readEmployee(result.data);
  },

  create: async (input: EmployeeInput) => {
    const result = await apiPost<unknown>(endpoints.employees, input);
    return { message: result.message, employee: readEmployee(result.data) };
  },

  update: async (id: string, input: Partial<EmployeeInput>) => {
    const result = await apiPut<unknown>(endpoints.employee(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete<unknown>(endpoints.employee(id));
    return result.message;
  },
};
