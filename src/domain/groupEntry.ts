const DAY = /^\d{4}-\d{2}-\d{2}$/;

export interface GroupEmployeeRow {
  /** 员工主键。保存时写入 records.employeeId。 */
  id: string;
  /** 工号，只展示。 */
  staffNo: string;
  name: string;
  quantity: number | null;
  remark: string;
}

export interface GroupSection {
  id: string;
  name: string;
  employees: GroupEmployeeRow[];
}

export interface GroupInitView {
  factoryName: string;
  date: string;
  editable: boolean;
  groups: GroupSection[];
}

interface InitEmployee {
  id?: string;
  employeeId?: string;
  name?: string;
}

interface InitRecord {
  employeeId?: string;
  groupId?: string;
  quantity?: number;
  remark?: string;
}

export function normalizeGroupInit(body: {
  factory?: { name?: string };
  date?: string;
  editable?: boolean;
  groups?: Array<{ id?: string; name?: string; employees?: InitEmployee[] }>;
  records?: InitRecord[];
}): GroupInitView {
  if (!Array.isArray(body.groups)) {
    throw new Error('响应缺少 groups');
  }
  const records = Array.isArray(body.records) ? body.records : [];
  return {
    factoryName: body.factory?.name || '厂区',
    date: body.date || '',
    editable: body.editable === true,
    groups: body.groups.map((group) => ({
      id: group.id || '',
      name: group.name || '小组',
      employees: (group.employees || []).filter((employee) => employee.id).map((employee) => {
        const saved = records.find((record) => record.employeeId === employee.id && record.groupId === group.id)
          || records.find((record) => record.employeeId === employee.id);
        return {
          id: employee.id as string,
          staffNo: employee.employeeId || '',
          name: employee.name || '未命名员工',
          quantity: typeof saved?.quantity === 'number' ? saved.quantity : null,
          remark: saved?.remark || '',
        };
      }),
    })),
  };
}

export function buildGroupSavePayload(input: {
  token: string;
  date: string;
  groupId: string;
  records: Array<{ employeeId: string; quantity: number; remark?: string }>;
}) {
  const date = input.date.trim();
  if (!DAY.test(date)) throw new Error('日期格式应为 YYYY-MM-DD');
  if (!input.groupId) throw new Error('缺少 groupId');
  return {
    token: input.token,
    date,
    groupId: input.groupId,
    records: input.records.map((record) => ({
      employeeId: record.employeeId,
      quantity: record.quantity,
      remark: record.remark ?? '',
    })),
  };
}

export function buildGroupEntryLink(origin: string, token: string): string {
  const url = new URL('/h5/group-capacity-entry', origin);
  url.searchParams.set('token', token);
  return url.toString();
}
