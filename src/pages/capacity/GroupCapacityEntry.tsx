import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, DatePicker, InputNumber, Spin, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { readErrorMessage } from '../../domain/apiEnvelope';
import type { GroupInitView } from '../../domain/groupEntry';
import { groupEntryApi } from '../../services/groupEntry';

const GroupCapacityEntry = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [view, setView] = useState<GroupInitView | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async (nextDate: Dayjs) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await groupEntryApi.init(token, nextDate.format('YYYY-MM-DD'));
      const initial: Record<string, number | null> = {};
      data.groups.forEach((group) => {
        group.employees.forEach((employee) => {
          initial[employee.id] = employee.quantity;
        });
      });
      setView(data);
      setQuantities(initial);
    } catch (err) {
      setView(null);
      setError(readErrorMessage(err, '链接无效或已失效'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    load(dayjs());
    // 只在令牌变化时拉一次；改日期由日期控件单独触发。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const employeeCount = useMemo(
    () => view?.groups.reduce((sum, group) => sum + group.employees.length, 0) ?? 0,
    [view],
  );

  const save = async () => {
    if (!view) return;
    const records = view.groups.flatMap((group) => group.employees.flatMap((employee) => {
      const quantity = quantities[employee.id];
      if (quantity === null || quantity === undefined) return [];
      return [{ employeeId: employee.id, quantity }];
    }));
    if (!records.length) {
      message.warning('请至少填写一名员工的产量');
      return;
    }
    setSaving(true);
    try {
      const text = await groupEntryApi.save({
        token,
        date: date.format('YYYY-MM-DD'),
        records,
      });
      message.success(text || '产量已保存');
    } catch (err) {
      message.error(readErrorMessage(err, '保存失败'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '16px 16px calc(88px + env(safe-area-inset-bottom))' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, margin: '8px 0' }}>{view?.factoryName || '小组产量'}</h1>
        <p style={{ color: '#666', marginTop: 0 }}>填写今天每人的完成数量。请使用员工本人，不要填工号。</p>
        {!token && <Alert title="链接里没有入口令牌，请向管理员要新的群链接" type="error" showIcon />}
        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 12 }} />}
        <div style={{ marginBottom: 12 }}>
          <DatePicker
            value={date}
            allowClear={false}
            inputReadOnly
            style={{ width: '100%' }}
            size="large"
            onChange={(value) => {
              if (!value) return;
              setDate(value);
              load(value);
            }}
          />
        </div>
        <Spin spinning={loading}>
          {view && employeeCount === 0 && <Alert title="这一天没有可填报的员工" type="info" showIcon />}
          {view?.groups.map((group) => (
            <section key={group.id} style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, margin: '4px 0 12px' }}>{group.name}</h2>
              {group.employees.map((employee) => (
                <label key={employee.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
                  <span>
                    <strong style={{ fontSize: 16 }}>{employee.name}</strong>
                    {employee.employeeNo && <span style={{ display: 'block', color: '#999', fontSize: 12 }}>{employee.employeeNo}</span>}
                  </span>
                  <InputNumber
                    min={0}
                    inputMode="numeric"
                    size="large"
                    disabled={view.editable === false}
                    value={quantities[employee.id]}
                    style={{ width: 120, fontSize: 16 }}
                    onChange={(value) => setQuantities((current) => ({ ...current, [employee.id]: typeof value === 'number' ? value : null }))}
                  />
                </label>
              ))}
            </section>
          ))}
        </Spin>
      </div>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', background: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <Button type="primary" block size="large" loading={saving} disabled={!token || !view?.editable} onClick={save}>
            保存今日产量
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupCapacityEntry;
