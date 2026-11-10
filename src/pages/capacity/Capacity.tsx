import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, DatePicker, Empty, Form, Input, InputNumber, Modal, Select, Space, Table, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { readErrorMessage } from '../../domain/apiEnvelope';
import { useAccess } from '../../hooks/useAccess';
import { capacityApi, planStatusLabel, type PlanInput, type ProductionPlan } from '../../services/capacity';
import { useFactoryStore } from '../../stores/factoryStore';

interface PlanForm {
  productName: string;
  targetQty: number;
  range: [dayjs.Dayjs, dayjs.Dayjs];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  clothingType?: string;
  craftType?: string;
  material?: string;
}

const CapacityPage = () => {
  const factory = useFactoryStore((state) => state.currentFactory);
  const { canWriteCore, isFactoryAdmin } = useAccess();
  const navigate = useNavigate();
  const [form] = Form.useForm<PlanForm>();
  const [rows, setRows] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const factoryId = factory?.id;
  const load = useCallback(async () => {
    if (!factoryId) return;
    setLoading(true);
    setError('');
    try {
      setRows(await capacityApi.list());
    } catch (err) {
      setError(readErrorMessage(err, '生产计划加载失败'));
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
    const input: PlanInput = {
      productName: values.productName.trim(),
      targetQty: values.targetQty,
      startDate: values.range[0].format('YYYY-MM-DD'),
      endDate: values.range[1].format('YYYY-MM-DD'),
      status: values.status,
      clothingType: values.clothingType?.trim(),
      craftType: values.craftType?.trim(),
      material: values.material?.trim(),
    };
    setSaving(true);
    try {
      const created = await capacityApi.create(input);
      message.success(created.message);
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
        <h1>生产计划</h1>
        {canWriteCore && <Button type="primary" onClick={() => { form.resetFields(); setOpen(true); }}>新建计划</Button>}
      </div>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        locale={{ emptyText: '还没有生产计划' }}
        scroll={{ x: 800 }}
        columns={[
          { title: '款式 / 产品', dataIndex: 'productName' },
          { title: '目标产量', dataIndex: 'targetQty' },
          { title: '开始', dataIndex: 'startDate' },
          { title: '结束', dataIndex: 'endDate' },
          { title: '状态', dataIndex: 'status', render: (value) => planStatusLabel(value) },
          {
            title: '操作',
            render: (_, row) => (
              <Space>
                <Button size="small" onClick={() => navigate(`/capacity/${row.id}`)}>工序与计件</Button>
                {isFactoryAdmin && (
                  <Button size="small" danger onClick={() => Modal.confirm({
                    title: `删除计划「${row.productName}」？`,
                    okText: '删除',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk: async () => {
                      message.success(await capacityApi.remove(row.id));
                      await load();
                    },
                  })}>删除</Button>
                )}
              </Space>
            ),
          },
        ]}
      />
      <Modal title="新建生产计划" open={open} onCancel={() => setOpen(false)} onOk={submit} confirmLoading={saving} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="productName" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}><Input /></Form.Item>
          <Form.Item name="targetQty" label="目标产量" rules={[{ required: true, message: '请输入目标产量' }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="range" label="起止日期" rules={[{ required: true, message: '请选择日期' }]}><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="IN_PROGRESS" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={[
              { value: 'PENDING', label: '待开始' },
              { value: 'IN_PROGRESS', label: '进行中' },
              { value: 'COMPLETED', label: '已完成' },
              { value: 'DELAYED', label: '延期' },
            ]} />
          </Form.Item>
          <Form.Item name="clothingType" label="服装类型"><Input placeholder="用于生成工序，例如衬衫" /></Form.Item>
          <Form.Item name="craftType" label="工艺"><Input placeholder="例如平车" /></Form.Item>
          <Form.Item name="material" label="面料"><Input placeholder="例如纯棉" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CapacityPage;
