import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Empty, Form, Input, Modal, Select, Space, Table, message } from 'antd';
import { readErrorMessage } from '../../domain/apiEnvelope';
import { useAccess } from '../../hooks/useAccess';
import { departmentApi, type Department } from '../../services/department';
import { useFactoryStore } from '../../stores/factoryStore';

interface FlatDepartment extends Department {
  depth: number;
}

function flatten(nodes: Department[], depth = 0): FlatDepartment[] {
  const rows: FlatDepartment[] = [];
  nodes.forEach((node) => {
    rows.push({ ...node, depth });
    if (node.children?.length) rows.push(...flatten(node.children, depth + 1));
  });
  return rows;
}

const DepartmentPage = () => {
  const factory = useFactoryStore((state) => state.currentFactory);
  const { canEdit } = useAccess();
  const [form] = Form.useForm<{ name: string; parentId?: string }>();
  const [rows, setRows] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);

  const flat = useMemo(() => flatten(rows), [rows]);
  const parentName = (id?: string | null) => flat.find((item) => item.id === id)?.name || '-';

  const factoryId = factory?.id;
  const load = useCallback(async () => {
    if (!factoryId) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setRows(await departmentApi.list(factoryId));
    } catch (err) {
      setError(readErrorMessage(err, '部门加载失败'));
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
      const text = editing
        ? await departmentApi.update(editing.id, { name: values.name, parentId: values.parentId || null })
        : await departmentApi.create({ name: values.name, factoryId: factory.id, parentId: values.parentId || null });
      message.success(text);
      setOpen(false);
      await load();
    } catch (err) {
      message.error(readErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!factory) {
    return <div className="page-container"><Empty description="请先在顶栏选择厂区" /></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>部门</h1>
        {canEdit && (
          <Button type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
            新建部门
          </Button>
        )}
      </div>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={flat}
        locale={{ emptyText: '还没有部门' }}
        columns={[
          {
            title: '名称',
            dataIndex: 'name',
            render: (name: string, row) => <span style={{ paddingLeft: row.depth * 16 }}>{name}</span>,
          },
          { title: '上级', render: (_, row) => parentName(row.parentId) },
          { title: '人数', dataIndex: 'employeeCount', render: (value) => value ?? '-' },
          {
            title: '操作',
            render: (_, row) => canEdit && (
              <Space>
                <Button size="small" onClick={() => { setEditing(row); form.setFieldsValue({ name: row.name, parentId: row.parentId || undefined }); setOpen(true); }}>编辑</Button>
                <Button
                  size="small"
                  danger
                  onClick={() => Modal.confirm({
                    title: `删除部门「${row.name}」？`,
                    okText: '删除',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk: async () => {
                      message.success(await departmentApi.remove(row.id));
                      await load();
                    },
                  })}
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={editing ? '编辑部门' : '新建部门'} open={open} onCancel={() => setOpen(false)} onOk={submit} confirmLoading={saving} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
          <Form.Item name="parentId" label="上级部门">
            <Select
              allowClear
              placeholder="无上级则为根部门"
              options={flat.filter((item) => item.id !== editing?.id).map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentPage;
