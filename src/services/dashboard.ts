import { readDashboard, type DashboardOverview } from '../domain/dashboard';
import { apiGet } from './http';
import { endpoints } from './endpoints';

export type { DashboardOverview };

export const dashboardApi = {
  overview: async (factoryId?: string) => {
    const result = await apiGet<unknown>(endpoints.dashboard, factoryId ? { factoryId } : undefined);
    return readDashboard(result.data);
  },
};
