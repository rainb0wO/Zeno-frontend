import { requireList } from '../domain/apiEnvelope';
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { endpoints } from './endpoints';

export type SalaryType = 'PIECE' | 'TIME' | 'FIXED';

export interface Employee {
  id: string;
  name: string;
  employeeId?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  position?: string | null;
  salaryType?: SalaryType | null;
  pieceRate?: number | null;
  status?: string | null;
}

export interface EmployeeInput {
  name: string;
  departmentId?: string | null;
  position?: string;
  salaryType?: SalaryType;
  pieceRate?: number;
  status?: string;
}

export interface EmployeeQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
  unassigned?: boolean;
}

export const personnelApi = {
  list: async (query: EmployeeQuery = {}) => {
    const result = await apiGet<{ employees: Employee[]; total: number; page: number; pageSize: number }>(
      endpoints.employees,
      {
        keyword: query.keyword,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 100,
        unassigned: query.unassigned ? 1 : undefined,
      },
    );
    return {
      employees: requireList<Employee>(result, 'employees'),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  },

  get: async (id: string) => {
    const result = await apiGet<{ employee: Employee }>(endpoints.employee(id));
    if (!result.employee) throw new Error('响应缺少 employee');
    return result.employee;
  },

  create: async (input: EmployeeInput) => {
    const result = await apiPost<{ employee: Employee }>(endpoints.employees, input);
    if (!result.employee) throw new Error('响应缺少 employee');
    return { message: result.message, employee: result.employee };
  },

  update: async (id: string, input: Partial<EmployeeInput>) => {
    const result = await apiPut(endpoints.employee(id), input);
    return result.message;
  },

  remove: async (id: string) => {
    const result = await apiDelete(endpoints.employee(id));
    return result.message;
  },
};
