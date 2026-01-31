import { get, post, put, del } from './request';

// 部门类型
export interface Department {
  id: string;
  name: string;
  factoryId: string;
  parentId?: string | null;
  leaderId?: string | null;
  status: number; // 1 正常 / 0 停用
  deletedAt?: string | null;
  purgedAt?: string | null;
  employeeCount?: number; // 员工数量（包含子部门）
  createdAt?: string;
  updatedAt?: string;
  children?: Department[]; // 子部门
}

// 创建部门参数
export interface CreateDepartmentParams {
  name: string;
  factoryId: string;
  parentId?: string | null;
  leaderId?: string | null;
}

// 更新部门参数
export interface UpdateDepartmentParams {
  name: string;
  leaderId?: string | null;
}

// 批量分配员工参数
export interface AssignEmployeesParams {
  employeeIds: string[];
}

// 部门管理API
export const departmentApi = {
  // 获取部门树形列表
  getDepartments: (params?: {
    factoryId?: string;
    includeDeleted?: boolean;
  }): Promise<{ departments: Department[] }> => {
    return get<{ departments: Department[] }>('/departments', params);
  },

  // 获取部门详情
  getDepartmentById: (id: string): Promise<{ department: Department }> => {
    return get<{ department: Department }>(`/departments/${id}`);
  },

  // 创建部门
  createDepartment: (params: CreateDepartmentParams): Promise<{ message: string; department: Department }> => {
    return post<{ message: string; department: Department }>('/departments', params);
  },

  // 更新部门
  updateDepartment: (id: string, params: UpdateDepartmentParams): Promise<{ message: string; department: Department }> => {
    return put<{ message: string; department: Department }>(`/departments/${id}`, params);
  },

  // 逻辑删除部门（级联）
  deleteDepartment: (id: string): Promise<{ message: string; cascadeCount: number }> => {
    return del<{ message: string; cascadeCount: number }>(`/departments/${id}`);
  },

  // 恢复部门
  restoreDepartment: (id: string): Promise<{ message: string }> => {
    return post<{ message: string }>(`/departments/${id}/restore`);
  },

  // 永久清除部门（仅 SUPER_ADMIN）
  forceDeleteDepartment: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/departments/${id}?force=true`);
  },

  // 批量分配员工到部门
  assignEmployees: (departmentId: string, params: AssignEmployeesParams): Promise<{ success: boolean; updated: number }> => {
    return post<{ success: boolean; updated: number }>(`/departments/${departmentId}/employees`, params);
  },

  // 获取部门下的员工列表（包含子部门）
  getDepartmentEmployees: (departmentId: string, params?: {
    includeSubDepartments?: boolean;
  }): Promise<{ employees: any[] }> => {
    return get<{ employees: any[] }>(`/departments/${departmentId}/employees`, params);
  },
};

export default departmentApi;

