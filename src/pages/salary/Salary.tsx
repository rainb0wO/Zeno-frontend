import { useEffect, useState } from 'react';
import { Alert, Button, Card, DatePicker, Empty, Form, Select, Statistic, message } from 'antd';
import dayjs from 'dayjs';
import { readErrorMessage } from '../../domain/apiEnvelope';
import { personnelApi, type Employee } from '../../services/personnel';
import { salaryApi } from '../../services/salary';
import { useFactoryStore } from '../../stores/factoryStore';

const SalaryPage = () => {
  const factory = useFactoryStore((state) => state.currentFactory);
  const [form] = Form.useForm<{ employeeId: string; month: dayjs.Dayjs }>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [piecePay, setPiecePay] = useState<number | null>(null);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    if (!factory?.id) return;
    personnelApi.list().then((page) => page.employees)
      .then(setEmployees)
      .catch((err) => setError(readErrorMessage(err, '员工列表加载失败')));
  }, [factory?.id]);

  const submit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setError('');
    try {
      const result = await salaryApi.calculate(values.employeeId, values.month.format('YYYY-MM'));
      setPiecePay(result.piecePay);
      setCalculated(true);
      if (result.piecePay === null) {
        message.warning('计算完成，但响应里没有 salaryCalculation.piecePay');
      } else {
        message.success(result.message);
      }
    } catch (err) {
      setCalculated(false);
      setError(readErrorMessage(err, '工资计算失败'));
    } finally {
      setLoading(false);
    }
  };

  if (!factory) return <div className="page-container"><Empty description="请先在顶栏选择厂区" /></div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>月工资</h1></div>
      <p style={{ color: '#666' }}>按员工主键和月份计算，金额取计件工资 piecePay。</p>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Card>
        <Form form={form} layout="vertical" onFinish={submit} initialValues={{ month: dayjs() }}>
          <Form.Item name="employeeId" label="员工" rules={[{ required: true, message: '请选择员工' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={employees.length ? '选择员工' : '该厂区还没有员工'}
              options={employees.map((item) => ({ value: item.id, label: `${item.name}${item.employeeId ? `（${item.employeeId}）` : ''}` }))}
            />
          </Form.Item>
          <Form.Item name="month" label="月份" rules={[{ required: true, message: '请选择月份' }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>计算</Button>
        </Form>
      </Card>
      {calculated && (
        <Card style={{ marginTop: 16 }}>
          {piecePay === null
            ? <Empty description="这次计算没有返回计件工资" />
            : <Statistic title="计件工资" prefix="¥" precision={2} value={piecePay} />}
        </Card>
      )}
    </div>
  );
};

export default SalaryPage;
