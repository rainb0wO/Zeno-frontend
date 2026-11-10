export interface DashboardOverview {
  employeeCount: number;
  departmentCount: number;
  planCount: number;
  todayOutput: number;
  monthPiecePay: number;
}

function numberField(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** 仪表盘只读取工厂范围内的这五个字段。 */
export function readDashboard(data: unknown): DashboardOverview {
  const source = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  return {
    employeeCount: numberField(source, 'employeeCount'),
    departmentCount: numberField(source, 'departmentCount'),
    planCount: numberField(source, 'planCount'),
    todayOutput: numberField(source, 'todayOutput'),
    monthPiecePay: numberField(source, 'monthPiecePay'),
  };
}
