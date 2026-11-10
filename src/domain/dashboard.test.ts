import { describe, expect, it } from 'vitest';
import { readDashboard } from './dashboard';

describe('dashboard', () => {
  it('reads the original statistics object and ignores invented aliases', () => {
    const overview = readDashboard({
      code: 0,
      message: 'ok',
      employeeCount: 99,
      employee: { total: 3, momGrowthRate: 0 },
      capacity: { todayRate: 1, todayPlan: 10, todayActual: 8 },
      salary: { monthTotal: 20, momGrowthRate: 0, base: 0, bonus: 0, allowance: 0 },
      attendance: { todayRate: 1, shouldAttend: 3, actualAttend: 3 },
      capacityPlans: [{ name: '圆领T恤', plan: 10, actual: 8, rate: 0.8 }],
    });
    expect(overview.employee.total).toBe(3);
    expect(overview.capacity.todayActual).toBe(8);
    expect(overview.salary.monthTotal).toBe(20);
    expect(overview.capacityPlans[0].name).toBe('圆领T恤');
  });
});