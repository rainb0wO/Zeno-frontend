const DAY = /^\d{4}-\d{2}-\d{2}$/;

export interface GroupEmployeeRow {
  id: string;
  name: string;
  employeeNo?: string;
  quantity: number | null;
}

export interface GroupSection {
  id: string;
  name: string;
  employees: GroupEmployeeRow[];
}

export interface GroupInitView {
  factoryName: string;
  editable: boolean;
  groups: GroupSection[];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readEmployee(value: unknown): GroupEmployeeRow | null {
  const row = asRecord(value);
  const id = row.id;
  if (typeof id !== 'string' || !id) return null;
  const quantity = row.quantity ?? row.output ?? row.actualQty;
  return {
    id,
    name: typeof row.name === 'string' && row.name ? row.name : '未命名员工',
    employeeNo: typeof row.employeeNo === 'string' ? row.employeeNo : undefined,
    quantity: typeof quantity === 'number' && Number.isFinite(quantity) ? quantity : null,
  };
}

function readGroup(value: unknown, index: number): GroupSection | null {
  const row = asRecord(value);
  const employees = Array.isArray(row.employees)
    ? row.employees.map(readEmployee).filter((item): item is GroupEmployeeRow => item !== null)
    : [];
  if (!employees.length && typeof row.id !== 'string') return null;
  return {
    id: typeof row.id === 'string' && row.id ? row.id : `group-${index}`,
    name: typeof row.name === 'string' && row.name ? row.name : '本组',
    employees,
  };
}

export function normalizeGroupInit(data: unknown): GroupInitView {
  const body = asRecord(data);
  const factory = asRecord(body.factory);
  const factoryName = typeof body.factoryName === 'string'
    ? body.factoryName
    : (typeof factory.name === 'string' ? factory.name : '厂区');
  const editable = body.editable !== false;

  if (Array.isArray(body.groups)) {
    const groups = body.groups
      .map((group, index) => readGroup(group, index))
      .filter((group): group is GroupSection => group !== null && group.employees.length > 0);
    return { factoryName, editable, groups };
  }

  const employees = Array.isArray(body.employees)
    ? body.employees.map(readEmployee).filter((item): item is GroupEmployeeRow => item !== null)
    : [];
  return {
    factoryName,
    editable,
    groups: employees.length ? [{ id: 'default', name: '本组', employees }] : [],
  };
}

export function buildGroupSavePayload(input: {
  token: string;
  date: string;
  records: Array<{ employeeId: string; quantity: number }>;
}) {
  const date = input.date.trim();
  if (!DAY.test(date)) {
    throw new Error('日期格式应为 YYYY-MM-DD');
  }
  return {
    token: input.token,
    date,
    records: input.records.map((record) => ({
      employeeId: record.employeeId,
      quantity: record.quantity,
    })),
  };
}

export function buildGroupEntryLink(origin: string, token: string): string {
  const url = new URL('/h5/group-capacity-entry', origin);
  url.searchParams.set('token', token);
  return url.toString();
}

export function readRotatedToken(data: unknown): { token: string; url?: string } {
  const body = asRecord(data);
  const tokenValue = body.token ?? body.groupEntryToken;
  const token = typeof tokenValue === 'string' ? tokenValue : '';
  const url = typeof body.url === 'string' ? body.url : undefined;
  return { token, url };
}
