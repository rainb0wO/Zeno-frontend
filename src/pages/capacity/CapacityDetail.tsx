import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Form, Input, InputNumber, Modal, Select, Space, Table, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { readErrorMessage } from '../../domain/apiEnvelope';
import { useAccess } from '../../hooks/useAccess';
import { capacityApi, planStatusLabel, type ProductionPlan } from '../../services/capacity';
import { personnelApi, type Employee } from '../../services/personnel';
import { pieceWorkApi, type PieceWork } from '../../services/pieceWork';
import { processApi, type ProcessRecord, type ProcessStep } from '../../services/process';
import { useFactoryStore } from '../../stores/factoryStore';

const CapacityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const factory = useFactoryStore((state) => state.currentFactory);
  const { canWriteCore } = useAccess();
  const [generateForm] = Form.useForm<{ clothingType: string; craftType: string; material: string }>();
  const [processForm] = Form.useForm<ProcessStep>();
  const [pieceForm] = Form.useForm<{ processId: string; employeeId: string; quantity: number }>();
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  const [drafts, setDrafts] = useState<ProcessStep[]>([]);
  const [pieceWorks, setPieceWorks] = useState<PieceWork[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessRecord | null>(null);
  const [pieceOpen, setPieceOpen] = useState(false);

  const factoryId = factory?.id;
  const load = useCallback(async () => {
    if (!id || !factoryId) return;
    setLoading(true);
    setError('');
    try {
      const [planItem, processRows, pieceRows, employeeRows] = await Promise.all([
        capacityApi.get(id),
        processApi.listByPlan(id),
        pieceWorkApi.list(id),
        personnelApi.list().then((page) => page.employees),
      ]);
      setPlan(planItem);
      setProcesses(processRows);
      setPieceWorks(pieceRows);
      setEmployees(employeeRows);
    } catch (err) {
      setError(readErrorMessage(err, '计划详情加载失败'));
    } finally {
      setLoading(false);
    }
  }, [id, factoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const generate = async () => {
    const values = await generateForm.validateFields();
    try {
      const generated = await processApi.generate(values);
      if (!generated.processes.length) {
        message.warning('没有生成工序');
        return;
      }
      setDrafts(generated.processes);
      message.success(generated.matched ? '已匹配工序模板，确认后保存' : `已生成 ${generated.processes.length} 道工序，确认后保存`);
    } catch (err) {
      message.error(readErrorMessage(err, '生成工序失败'));
    }
  };

  const persistDrafts = async () => {
    if (!id || !drafts.length) return;
    try {
      const saved = await processApi.save(id, drafts);
      message.success(saved.message);
      setDrafts([]);
      setGenerateOpen(false);
      await load();
    } catch (err) {
      message.error(readErrorMessage(err, '保存工序失败'));
    }
  };

  const saveProcess = async () => {
    if (!editing) return;
    const values = await processForm.validateFields();
    try {
      message.success(await processApi.update(editing.id, values));
      setEditing(null);
      await load();
    } catch (err) {
      message.error(readErrorMessage(err));
    }
  };

  const savePiece = async () => {
    if (!id) return;
    const values = await pieceForm.validateFields();
    try {
      const created = await pieceWorkApi.create({ planId: id, ...values });
      message.success(created.message);
      setPieceOpen(false);
      await load();
    } catch (err) {
      message.error(readErrorMessage(err));
    }
  };

  const employeeName = (employeeId: string) => employees.find((item) => item.id === employeeId)?.name || employeeId;
  const processName = (processId?: string) => processes.find((item) => item.id === processId)?.name || processId || '-';

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>{plan?.productName || '生产计划'}</h1>
        <Button onClick={() => navigate('/capacity')}>返回</Button>
      </div>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {plan && (
        <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="目标产量">{plan.targetQty}</Descriptions.Item>
          <Descriptions.Item label="日期">{plan.startDate} 至 {plan.endDate}</Descriptions.Item>
          <Descriptions.Item label="状态">{planStatusLabel(plan.status)}</Descriptions.Item>
          <Descriptions.Item label="款式">{[plan.clothingType, plan.craftType, plan.material].filter(Boolean).join(' / ') || '-'}</Descriptions.Item>
        </Descriptions>
      )}

      <Card
        title="工序"
        loading={loading}
        extra={canWriteCore && <Button onClick={() => { generateForm.setFieldsValue({ clothingType: plan?.clothingType || '', craftType: plan?.craftType || '', material: plan?.material || '' }); setDrafts([]); setGenerateOpen(true); }}>生成工序</Button>}
        style={{ marginBottom: 16 }}
      >
        <Table
          rowKey="id"
          dataSource={processes}
          locale={{ emptyText: '还没有工序' }}
          pagination={false}
          columns={[
            { title: '名称', dataIndex: 'name' },
            { title: '说明', dataIndex: 'description', render: (value) => value || '-' },
            {
              title: '操作',
              render: (_, row) => canWriteCore && <Button size="small" onClick={() => { setEditing(row); processForm.setFieldsValue({ name: row.name, description: row.description }); }}>编辑</Button>,
            },
          ]}
        />
      </Card>

      <Card
        title="计件"
        extra={canWriteCore && <Button onClick={() => { pieceForm.resetFields(); setPieceOpen(true); }} disabled={!processes.length}>登记计件</Button>}
      >
        <Table
          rowKey="id"
          dataSource={pieceWorks}
          locale={{ emptyText: '还没有计件记录' }}
          pagination={false}
          columns={[
            { title: '员工', dataIndex: 'employeeId', render: (value: string) => employeeName(value) },
            { title: '工序', dataIndex: 'processId', render: (value) => processName(value) },
            { title: '数量', dataIndex: 'quantity' },
            { title: '备注', dataIndex: 'remark', render: (value) => value || '-' },
          ]}
        />
      </Card>

      <Modal title="生成并保存工序" open={generateOpen} onCancel={() => setGenerateOpen(false)} footer={null} destroyOnHidden>
        <Form form={generateForm} layout="vertical">
          <Form.Item name="clothingType" label="服装类型" rules={[{ required: true, message: '请填写服装类型' }]}><Input /></Form.Item>
          <Form.Item name="craftType" label="工艺" rules={[{ required: true, message: '请填写工艺' }]}><Input /></Form.Item>
          <Form.Item name="material" label="面料" rules={[{ required: true, message: '请填写面料' }]}><Input /></Form.Item>
          <Space>
            <Button onClick={generate}>生成预览</Button>
            <Button type="primary" disabled={!drafts.length} onClick={persistDrafts}>保存到计划</Button>
          </Space>
        </Form>
        {drafts.length > 0 && (
          <Table
            style={{ marginTop: 16 }}
            rowKey={(_, index) => String(index)}
            pagination={false}
            dataSource={drafts}
            columns={[
              { title: '工序', dataIndex: 'name' },
              { title: '说明', dataIndex: 'description', render: (value) => value || '-' },
            ]}
          />
        )}
      </Modal>

      <Modal title="编辑工序" open={!!editing} onCancel={() => setEditing(null)} onOk={saveProcess} okText="保存" cancelText="取消">
        <Form form={processForm} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}><Input /></Form.Item>
          <Form.Item name="description" label="说明"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="登记计件" open={pieceOpen} onCancel={() => setPieceOpen(false)} onOk={savePiece} okText="保存" cancelText="取消">
        <Form form={pieceForm} layout="vertical">
          <Form.Item name="employeeId" label="员工" rules={[{ required: true, message: '请选择员工' }]}>
            <Select options={employees.map((item) => ({ value: item.id, label: item.name }))} />
          </Form.Item>
          <Form.Item name="processId" label="工序" rules={[{ required: true, message: '请选择工序' }]}>
            <Select options={processes.map((item) => ({ value: item.id, label: item.name }))} />
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CapacityDetail;
