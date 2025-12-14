import { get, post, put, del } from './request';

// 工资规则类型
export interface SalaryRule {
  id: string;
  factoryId: string;
  name: string;
  description: string;
  rules: any;
  createdAt: string;
  updatedAt: string;
}

// 工资记录类型
export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  basicSalary: number;
  overtimePay: number;
  piecePay: number;
  bonus: number;
  deduction: number;
  totalSalary: number;
  status: 'UNPAID' | 'PAID' | 'PARTIAL_PAID';
  createdAt: string;
  updatedAt: string;
}

// 创建工资规则参数
export interface CreateSalaryRuleParams {
  name: string;
  description: string;
  factoryId: string;
  rules: any;
}

// 计算工资参数
export interface CalculateSalaryParams {
  employeeId: string;
  month: string;
}

// 工资API
export const salaryApi = {
  // 获取工资规则列表
  getSalaryRules: (params?: {
    factoryId?: string;
  }): Promise<{ salaryRules: SalaryRule[] }> => {
    return get<{ salaryRules: SalaryRule[] }>('/salary/rules', params);
  },

  // 获取工资规则详情
  getSalaryRuleById: (id: string): Promise<{ salaryRule: SalaryRule }> => {
    return get<{ salaryRule: SalaryRule }>(`/salary/rules/${id}`);
  },

  // 创建工资规则
  createSalaryRule: (params: CreateSalaryRuleParams): Promise<{ message: string; salaryRule: SalaryRule }> => {
    return post<{ message: string; salaryRule: SalaryRule }>('/salary/rules', params);
  },

  // 更新工资规则
  updateSalaryRule: (id: string, params: Partial<CreateSalaryRuleParams>): Promise<{ message: string; salaryRule: SalaryRule }> => {
    return put<{ message: string; salaryRule: SalaryRule }>(`/salary/rules/${id}`, params);
  },

  // 删除工资规则
  deleteSalaryRule: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/salary/rules/${id}`);
  },

  // 获取工资记录列表
  getSalaryRecords: (params?: {
    employeeId?: string;
    month?: string;
    status?: string;
  }): Promise<{ salaryRecords: SalaryRecord[] }> => {
    return get<{ salaryRecords: SalaryRecord[] }>('/salary/records', params);
  },

  // 获取工资记录详情
  getSalaryRecordById: (id: string): Promise<{ salaryRecord: SalaryRecord }> => {
    return get<{ salaryRecord: SalaryRecord }>(`/salary/records/${id}`);
  },

  // 计算员工工资
  calculateSalary: (params: CalculateSalaryParams): Promise<{ 
    message: string; 
    salaryRecord: SalaryRecord 
  }> => {
    return post<{ message: string; salaryRecord: SalaryRecord }>('/salary/calculate', params);
  },

  // 更新工资记录
  updateSalaryRecord: (id: string, params: Partial<SalaryRecord>): Promise<{ message: string; salaryRecord: SalaryRecord }> => {
    return put<{ message: string; salaryRecord: SalaryRecord }>(`/salary/records/${id}`, params);
  },

  // 删除工资记录
  deleteSalaryRecord: (id: string): Promise<{ message: string }> => {
    return del<{ message: string }>(`/salary/records/${id}`);
  },

  // 批量生成工资条
  batchGenerateSalary: (params: {
    month: string;
    employeeIds?: string[];
    factoryId?: string;
  }): Promise<{ message: string; count: number }> => {
    return post<{ message: string; count: number }>('/salary/batch-generate', params);
  },

  // 发放工资
  paySalary: (id: string): Promise<{ message: string }> => {
    return post<{ message: string }>(`/salary/records/${id}/pay`);
  },
};

export default salaryApi;
