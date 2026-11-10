export interface DashboardPlan {
  name: string;
  plan: number;
  actual: number;
  rate: number;
}

export interface DashboardOverview {
  employee: { total: number; momGrowthRate: number };
  capacity: { todayRate: number; todayPlan: number; todayActual: number };
  salary: { monthTotal: number; momGrowthRate: number; base: number; bonus: number; allowance: number };
  attendance: { todayRate: number; shouldAttend: number; actualAttend: number };
  capacityPlans: DashboardPlan[];
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function block(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

/** 只读取文档里的原统计结构，不认别名。 */
export function readDashboard(body: unknown): DashboardOverview {
  const source = block(body);
  const employee = block(source.employee);
  const capacity = block(source.capacity);
  const salary = block(source.salary);
  const attendance = block(source.attendance);
  const plans = Array.isArray(source.capacityPlans) ? source.capacityPlans : [];
  return {
    employee: { total: num(employee.total), momGrowthRate: num(employee.momGrowthRate) },
    capacity: {
      todayRate: num(capacity.todayRate),
      todayPlan: num(capacity.todayPlan),
      todayActual: num(capacity.todayActual),
    },
    salary: {
      monthTotal: num(salary.monthTotal),
      momGrowthRate: num(salary.momGrowthRate),
      base: num(salary.base),
      bonus: num(salary.bonus),
      allowance: num(salary.allowance),
    },
    attendance: {
      todayRate: num(attendance.todayRate),
      shouldAttend: num(attendance.shouldAttend),
      actualAttend: num(attendance.actualAttend),
    },
    capacityPlans: plans.map((item) => {
      const row = block(item);
      return { name: typeof row.name === 'string' ? row.name : '', plan: num(row.plan), actual: num(row.actual), rate: num(row.rate) };
    }),
  };
}
