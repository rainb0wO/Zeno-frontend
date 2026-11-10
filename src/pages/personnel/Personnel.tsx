import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Empty, Form, Input, Modal, Select, Space, Table, message } from 'antd';
import { readErrorMessage } from '../../domain/apiEnvelope';
import { useAccess } from '../../hooks/useAccess';
import { departmentApi, type Department } from '../../services/department';
import { personnelApi, type Employee, type EmployeeInput } from '../../services/personnel';
import { useFactoryStore } from '../../stores/factoryStore';

function flatten(nodes: Department[]): Department[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flatten(node.children) : [])]);
}

const PersonnelPage = () => {
  const factory = useFactoryStore((state) => state.currentFactory);
  const { canEdit } = useAccess();
  const [form] = Form.useForm<EmployeeInput>();
  const [rows, setRows] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);

  const factoryId = factory?.id;
  const load = useCallback(async () => {
    if (!factoryId) return;
    setLoading(true);
    setError('');
    try {
      const [employees, depts] = await Promise.all([
        personnelApi.list(factoryId),
        departmentApi.list(factoryId),
      ]);
      setRows(employees);
      setDepartments(flatten(depts));
    } catch (err) {
      setError(readErrorMessage(err, '员工列表加载失败'));
    } finally {
      setLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!factory?.id) return;
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        message.success(await personnelApi.update(editing.id, values));
      } else {
        const created = await personnelApi.create({ ...values, factoryId: factory.id });
        message.success(created.message);
      }
      setOpen(false);
      await load();
    } catch (err) {
      message.error(readErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!factory) return <div className="page-container"><Empty description="请先在顶栏选择厂区" /></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>员工</h1>
        {canEdit && <Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>新建员工</Button>}
      </div>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        locale={{ emptyText: '还没有员工' }}
        scroll={{ x: 720 }}
        columns={[
          { title: '姓名', dataIndex: 'name' },
          { title: '手机', dataIndex: 'phone', render: (value) => value || '-' },
          { title: '工号', dataIndex: 'employeeNo', render: (value) => value || '-' },
          { title: '部门', dataIndex: 'departmentName', render: (value, row) => value || departments.find((item) => item.id === row.departmentId)?.name || '-' },
          { title: '岗位', dataIndex: 'position', render: (value) => value || '-' },
          {
            title: '操作',
            render: (_, row) => canEdit && (
              <Space>
                <Button size="small" onClick={() => {
                  setEditing(row);
                  form.setFieldsValue({
                    name: row.name,
                    phone: row.phone || undefined,
                    position: row.position || undefined,
                    departmentId: row.departmentId,
                  });
                  setOpen(true);
                }}>编辑</Button>
                <Button size="small" danger onClick={() => Modal.confirm({
                  title: `删除员工「${row.name}」？`,
                  okText: '删除',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk: async () => {
                    message.success(await personnelApi.remove(row.id));
                    await load();
                  },
                })}>删除</Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={editing ? '编辑员工' : '新建员工'} open={open} onCancel={() => setOpen(false)} onOk={submit} confirmLoading={saving} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}><Input /></Form.Item>
          <Form.Item name="phone" label="手机号"><Input /></Form.Item>
          <Form.Item name="position" label="岗位"><Input /></Form.Item>
          <Form.Item name="departmentId" label="部门">
            <Select allowClear placeholder="可不选" options={departments.map((item) => ({ value: item.id, label: item.name }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PersonnelPage;
