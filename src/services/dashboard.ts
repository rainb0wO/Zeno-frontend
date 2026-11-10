import { readDashboard, type DashboardOverview } from '../domain/dashboard';
import { apiGet } from './http';
import { endpoints } from './endpoints';

export type { DashboardOverview };

export const dashboardApi = {
  overview: async (range?: { startDate?: string; endDate?: string }) => {
    const result = await apiGet<DashboardOverview>(endpoints.dashboard, range);
    return readDashboard(result);
  },
};
