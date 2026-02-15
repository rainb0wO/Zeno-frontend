import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, DatePicker, Input, InputNumber, message, Select, Space, Spin, Table } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

type Employee = {
  id: string;
  employeeId?: string;
  name: string;
};

type Group = {
  id: string;
  name: string;
  employees: Employee[];
};

type FactoryInfo = {
  id: string;
  name: string;
};

type FormValue = {
  quantity?: number | null;
  remark?: string;
};

const GroupCapacityEntry = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [factory, setFactory] = useState<FactoryInfo | null>(null);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [editable, setEditable] = useState<boolean>(true);

  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string>('');

  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});

  useEffect(() => {
    setLoading(true);
    try {
      const mockFactory: FactoryInfo = { id: 'f1', name: '一厂' };
      const mockGroups: Group[] = [
        {
          id: 'g1',
          name: '一组',
          employees: [
            { id: '1', employeeId: 'EMP001', name: '张三' },
            { id: '2', employeeId: 'EMP002', name: '李四' },
          ],
        },
        {
          id: 'g2',
          name: '二组',
          employees: [{ id: '3', employeeId: 'EMP003', name: '王五' }],
        },
      ];

      const mockValues: Record<string, FormValue> = {
        '1': { quantity: 100, remark: '' },
        '2': { quantity: 90, remark: '新人' },
        '3': { quantity: 110, remark: '' },
      };

      setFactory(mockFactory);
      setGroups(mockGroups);
      setCurrentGroupId(mockGroups[0]?.id || '');
      setFormValues(mockValues);

      setEditable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentGroup = useMemo(() => {
    return groups.find((g) => g.id === currentGroupId) || null;
  }, [groups, currentGroupId]);

  const handleQuantityChange = (employeeId: string, value: number | null) => {
    setFormValues((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        quantity: value,
      },
    }));
  };

  const handleRemarkChange = (employeeId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        remark: value,
      },
    }));
  };

  const handleSaveCurrentGroup = async () => {
    if (!editable) {
      message.warning('该日期的数据已锁定，仅管理员可修改');
      return;
    }

    if (!currentGroupId || !currentGroup) {
      message.error('请先选择小组');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        token,
        date: date.format('YYYY-MM-DD'),
        groupId: currentGroupId,
        records: currentGroup.employees.map((emp) => ({
          employeeId: emp.id,
          quantity: Number(formValues[emp.id]?.quantity ?? 0),
          remark: String(formValues[emp.id]?.remark ?? ''),
        })),
      };

      // 初版仅 Mock 保存：后续改为调用后端接口
      // eslint-disable-next-line no-console
      console.log('Mock save payload:', payload);

      message.success('已模拟保存当前小组');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '工号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120,
      render: (v: string | undefined) => v || '-',
    },
    {
      title: '今日产量',
      key: 'quantity',
      width: 140,
      render: (_: any, record: Employee) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          precision={0}
          value={formValues[record.id]?.quantity ?? null}
          disabled={!editable}
          onChange={(v) => handleQuantityChange(record.id, v)}
          placeholder="输入数量"
        />
      ),
    },
    {
      title: '备注',
      key: 'remark',
      render: (_: any, record: Employee) => (
        <Input
          value={formValues[record.id]?.remark ?? ''}
          disabled={!editable}
          onChange={(e) => handleRemarkChange(record.id, e.target.value)}
          placeholder="可选"
        />
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{factory?.name ? `${factory.name} - 组长产能填报` : '组长产能填报'}</h1>
        <Space wrap size={10} style={{ alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#666' }}>日期</div>
          <DatePicker
            value={date}
            onChange={(v) => {
              if (v) setDate(v);
            }}
            allowClear={false}
          />
          <div style={{ fontSize: 12, color: '#666' }}>小组</div>
          <Select
            style={{ width: 160 }}
            value={currentGroupId}
            onChange={setCurrentGroupId}
            options={groups.map((g) => ({ label: g.name, value: g.id }))}
            placeholder="选择小组"
          />
        </Space>
      </div>

      <Alert
        type={editable ? 'info' : 'warning'}
        showIcon
        message={
          editable
            ? '说明：当日数据可由组长编辑，次日 00:00 后将自动锁定，仅管理员可修改。'
            : '该日期的数据已锁定，仅管理员可修改。'
        }
        style={{ marginBottom: 16 }}
      />

      {!token && (
        <Alert
          type="warning"
          showIcon
          message="当前链接缺少 token 参数，Mock 模式下仍可查看页面；对接后端后请使用带 token 的群入口链接。"
          style={{ marginBottom: 16 }}
        />
      )}

      <Card title={currentGroup ? `${currentGroup.name} - 员工列表` : '员工列表'}>
        <Spin spinning={loading || saving}>
          <Table
            size="middle"
            rowKey="id"
            dataSource={currentGroup?.employees || []}
            columns={columns as any}
            pagination={false}
          />

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={handleSaveCurrentGroup} disabled={!editable} loading={saving}>
              保存当前小组
            </Button>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default GroupCapacityEntry;

