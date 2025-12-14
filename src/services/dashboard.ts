import { get } from './request';

// Dashboard统计数据类型
export interface DashboardStatistics {
  totalEmployees: number;
  employeeGrowth: number;
  todayCapacity: number;
  capacityTarget: number;
  monthlySalary: number;
  salaryGrowth: number;
  todayAttendanceRate: number;
  attendanceChange: number;
}

// 生产计划进度
export interface ProductionProgress {
  id: string;
  name: string;
  progress: number;
  trend: 'up' | 'down';
}

// 工资分布
export interface SalaryDistribution {
  basic: number;
  bonus: number;
  other: number;
}

// Dashboard API
export const dashboardApi = {
  // 获取总览统计数据
  getStatistics: (factoryId?: string): Promise<{ statistics: DashboardStatistics }> => {
    return get<{ statistics: DashboardStatistics }>('/dashboard/statistics', { factoryId });
  },

  // 获取生产进度数据
  getProductionProgress: (factoryId?: string): Promise<{ progress: ProductionProgress[] }> => {
    return get<{ progress: ProductionProgress[] }>('/dashboard/production-progress', { factoryId });
  },

  // 获取工资分布数据
  getSalaryDistribution: (factoryId?: string): Promise<{ distribution: SalaryDistribution }> => {
    return get<{ distribution: SalaryDistribution }>('/dashboard/salary-distribution', { factoryId });
  },
};

export default dashboardApi;
