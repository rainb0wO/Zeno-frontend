import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Modal, Space, Table, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { readErrorMessage } from '../../domain/apiEnvelope';
import { buildGroupEntryLink } from '../../domain/groupEntry';
import { useAccess } from '../../hooks/useAccess';
import { factoryApi, type Factory, type FactoryInput } from '../../services/factory';

const FactoryPage = () => {
  const navigate = useNavigate();
  const { isFactoryAdmin, canWriteCore } = useAccess();
  const [form] = Form.useForm<FactoryInput>();
  const [rows, setRows] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Factory | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await factoryApi.list());
    } catch (err) {
      setError(readErrorMessage(err, '厂区列表加载失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (factory: Factory) => {
    setEditing(factory);
    form.setFieldsValue({
      name: factory.name,
      address: factory.address || '',
      contactPerson: factory.contactPerson || '',
      contactPhone: factory.contactPhone || '',
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        const text = await factoryApi.update(editing.id, values);
        message.success(text);
      } else {
        const created = await factoryApi.create(values);
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

  const remove = (factory: Factory) => {
    Modal.confirm({
      title: `删除厂区「${factory.name}」？`,
      content: '只删除你有权限管理的厂区。已有生产和人员数据时，后端可能会拒绝。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const text = await factoryApi.remove(factory.id);
        message.success(text);
        await load();
      },
    });
  };

  const rotate = async (factory: Factory) => {
    try {
      const result = await factoryApi.rotateGroupToken(factory.id, window.location.origin);
      if (!result.token && !result.url) {
        message.error('后端没有返回新的群入口令牌');
        return;
      }
      const link = result.url || buildGroupEntryLink(window.location.origin, result.token);
      Modal.success({
        title: '新的微信群入口已生成',
        content: (
          <div>
            <p>旧链接已失效。把下面的地址发到组长微信群：</p>
            <Input.TextArea value={link} readOnly autoSize />
          </div>
        ),
        okText: '复制链接',
        onOk: async () => {
          try {
            await navigator.clipboard.writeText(link);
            message.success('已复制');
          } catch {
            message.info('请手动复制链接');
          }
        },
      });
    } catch (err) {
      message.error(readErrorMessage(err, '轮换群入口失败'));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h1>厂区</h1>
        {canWriteCore && <Button type="primary" onClick={openCreate}>新建厂区</Button>}
      </div>
      <p style={{ color: '#666' }}>这里只列出你已加入的厂区。切换厂区请用顶栏。</p>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        locale={{ emptyText: '还没有可管理的厂区' }}
        scroll={{ x: 720 }}
        columns={[
          { title: '名称', dataIndex: 'name' },
          { title: '地址', dataIndex: 'address', render: (value) => value || '-' },
          { title: '联系人', dataIndex: 'contactPerson', render: (value) => value || '-' },
          { title: '电话', dataIndex: 'contactPhone', render: (value) => value || '-' },
          {
            title: '操作',
            render: (_, factory) => (
              <Space wrap>
                <Button size="small" onClick={() => navigate(`/factory/${factory.id}`)}>详情</Button>
                {canWriteCore && <Button size="small" onClick={() => rotate(factory)}>轮换群入口</Button>}
                {canWriteCore && <Button size="small" onClick={() => openEdit(factory)}>编辑</Button>}
                {isFactoryAdmin && <Button size="small" danger onClick={() => remove(factory)}>删除</Button>}
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? '编辑厂区' : '新建厂区'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="厂区名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址"><Input /></Form.Item>
          <Form.Item name="contactPerson" label="联系人"><Input /></Form.Item>
          <Form.Item name="contactPhone" label="联系电话"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FactoryPage;
