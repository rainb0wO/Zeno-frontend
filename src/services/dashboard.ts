import { get } from './request';

export type DashboardOverview = {
  employee: {
    total: number;
    momGrowthRate: number;
  };
  capacity: {
    todayRate: number;
    todayPlan: number;
    todayActual: number;
  };
  salary: {
    monthTotal: number;
    momGrowthRate: number;
    base: number;
    bonus: number;
    allowance: number;
  };
  attendance: {
    todayRate: number;
    shouldAttend: number;
    actualAttend: number;
  };
  capacityPlans: Array<{
    name: string;
    plan: number;
    actual: number;
    rate: number;
  }>;
};

export const dashboardApi = {
  getOverview: (params?: { startDate?: string; endDate?: string }): Promise<DashboardOverview> => {
    return get<DashboardOverview>('/dashboard/overview', params);
  },
};

export default dashboardApi;
