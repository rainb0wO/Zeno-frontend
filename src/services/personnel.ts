import { get, post, put, del } from './request';

// 员工类型
export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  factoryId: string;
  departmentId?: string;
  position: string;
  hireDate: string;
  salaryType: 'PIECE' | 'TIME' | 'FIXED';
  baseSalary?: number;
  pieceRate?: number;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// 部门类型
export interface Department {
  id: string;
  name: string;
  factoryId: string;
  createdAt: string;
  updatedAt: string;
}

// 创建员工参数
export interface CreateEmployeeParams {
  name: string;
  employeeId: string;
  factoryId: string;
  departmentId?: string;
  position: string;
  hireDate: string;
  salaryType: 'PIECE' | 'TIME' | 'FIXED';
  baseSalary?: number;
  pieceRate?: number;
  phone: string;
  address: string;
}

// 创建部门参数
export interface CreateDepartmentParams {
  name: string;
  factoryId: string;
}

// 人员管理API
export const personnelApi = {
  // 获取员工列表
  getEmployees: (params?: {
    factoryId?: string;
    departmentId?: string;
    keyword?: string;
  }): Promise<{ employees: Employee[] }> => {
    return get<{ employees: Employee[] }>('/employees', params);
  },

  // 获取员工详情
  getEmployeeById: (id: string): Promise<{ employee: Employee }> => {
    return get<{ employee: Employee }>(`/employees/${id}`);
  },

  // 创建员工
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

  // 删除部门
  deleteDepartment: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/employees/departments/${id}`);
  },
};

export default personnelApi;
