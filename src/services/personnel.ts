import { get, post, put, del } from './request';

// 员工类型
export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  factoryId?: string;
  departmentId?: string;
  departmentName?: string; // 部门名称（从后端返回）
  position?: string;
  hireDate?: string;
  salaryType?: 'PIECE' | 'TIME' | 'FIXED';
  baseSalary?: number;
  pieceRate?: number;
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
}

// ---- 已移除所有部门相关接口 ----
export interface Department {
  id: string;
  name: string;
  factoryId: string;
  createdAt: string;
  updatedAt: string;
}

// 创建员工参数
// 说明：为满足「前端只填写姓名 + 联系电话，其余由后端自动生成或使用默认值」的需求，
// 这里将除 name 外的字段全部改为可选。前端实际创建时只会传 { name, phone }。
export interface CreateEmployeeParams {
  name: string;
  employeeId?: string;
  factoryId?: string;
  departmentId?: string;
  position?: string;
  hireDate?: string;
  salaryType?: 'PIECE' | 'TIME' | 'FIXED';
  baseSalary?: number;
  pieceRate?: number;
  phone?: string;
  address?: string;
}

// 创建部门参数
export interface CreateDepartmentParams {
  name: string;
  factoryId: string;
}

// 批量导入与模板下载
export interface BatchImportResult {
  successCount: number;
  failureCount: number;
  errors?: Array<{ row: number; message: string }>;
}

// 人员管理API
export const personnelApi = {
  // 获取员工列表
  getEmployees: (params?: {
    factoryId?: string;
    departmentId?: string;
    keyword?: string;
    unassigned?: boolean; // 是否只查询未分配部门的员工
  }): Promise<{ employees: Employee[] }> => {
    return get<{ employees: Employee[] }>('/employees', params);
  },

  // 获取员工详情
  getEmployeeById: (id: string): Promise<{ employee: Employee }> => {
    return get<{ employee: Employee }>(`/employees/${id}`);
  },

  // 创建员工
  // 注意：前端只会传入 { name, phone }，其余字段由后端补充或使用默认值
  createEmployee: (params: CreateEmployeeParams): Promise<{ message: string; employee: Employee }> => {
    return post<{ message: string; employee: Employee }>('/employees', params);
  },

  // 更新员工
  updateEmployee: (id: string, params: Partial<CreateEmployeeParams>): Promise<{ message: string; employee: Employee }> => {
    return put<{ message: string; employee: Employee }>(`/employees/${id}`, params);
  },

  // 删除员工
  deleteEmployee: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/employees/${id}`);
  },

  // 获取部门列表
  getDepartments: (params?: {
    factoryId?: string;
  }): Promise<{ departments: Department[] }> => {
    return get<{ departments: Department[] }>('/employees/departments', params);
  },

  // 获取部门详情
  getDepartmentById: (id: string): Promise<{ department: Department }> => {
    return get<{ department: Department }>(`/employees/departments/${id}`);
  },

  // 创建部门
  createDepartment: (params: CreateDepartmentParams): Promise<{ message: string; department: Department }> => {
    return post<{ message: string; department: Department }>('/employees/departments', params);
  },

  // 更新部门
  updateDepartment: (id: string, params: { name: string }): Promise<{ message: string; department: Department }> => {
    return put<{ message: string; department: Department }>(`/employees/departments/${id}`, params);
  },

  // 下载批量导入模板
  downloadTemplate: (format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> => {
    // 直接返回 Blob，由调用方负责保存；若后端直接返回文件可用window.open
    // 此处仍使用 axios 封装，设置 responseType
    return get('/employees/template', { format }, { responseType: 'blob' as any });
  },

  // 批量导入员工
  batchImportEmployees: (file: File): Promise<BatchImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return post<BatchImportResult>('/employees/batchUpload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 删除部门
  deleteDepartment: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/employees/departments/${id}`);
  },
};

export default personnelApi;
