import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Checkbox, DatePicker, Input, InputNumber, Select, Spin, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { ApiError, readErrorMessage } from '../../domain/apiEnvelope';
import type { GroupInitView, GroupSaveRecord } from '../../domain/groupEntry';
import { hasValidJwt, isWeChatInApp } from '../../domain/wechat';
import { groupEntryApi } from '../../services/groupEntry';
import { assistantApi, type AssistantOption } from '../../services/assistant';
import { authApi } from '../../services/auth';
import { exchangeWeChatCode, startGroupSilentAuth } from '../../services/wechatAuth';
import { useUserStore } from '../../stores/userStore';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
  options?: AssistantOption[];
}

const GroupCapacityEntry = () => {
  const [params] = useSearchParams();
  const { setToken, setUser } = useUserStore();
  const token = params.get('token') || '';
  const groupParam = params.get('group') || '';
  const codeParam = params.get('code') || '';
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [view, setView] = useState<GroupInitView | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number | null>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [absentMap, setAbsentMap] = useState<Record<string, boolean>>({});
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [authed, setAuthed] = useState(() => hasValidJwt(localStorage.getItem('token')));
  const [wechatNotice, setWechatNotice] = useState('');
  const [bindNotice, setBindNotice] = useState('');
  const bootedRef = useRef(false);
  // 助手对话。
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);
  const [chatError, setChatError] = useState('');
  const lastQuestionRef = useRef('');

  const load = async (nextDate: Dayjs) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await groupEntryApi.init(token, nextDate.format('YYYY-MM-DD'));
      const initial: Record<string, number | null> = {};
      const initialRemarks: Record<string, string> = {};
      const initialAbsent: Record<string, boolean> = {};
      data.groups.forEach((group) => {
        group.employees.forEach((employee) => {
          initial[employee.id] = employee.quantity;
          initialRemarks[employee.id] = employee.remark;
          initialAbsent[employee.id] = employee.absent;
        });
      });
      setView(data);
      setQuantities(initial);
      setRemarks(initialRemarks);
      setAbsentMap(initialAbsent);
      // group 参数预选对应组；用户仍可切换组。参数无效时默认第一个组。
      setSelectedGroupId((current) => {
        if (current && data.groups.some((group) => group.id === current)) return current;
        if (groupParam && data.groups.some((group) => group.id === groupParam)) return groupParam;
        return data.groups[0]?.id || '';
      });
    } catch (err) {
      setView(null);
      setError(readErrorMessage(err, '链接无效或已失效'));
    } finally {
      setLoading(false);
    }
  };

  // 首次进入：先处理静默授权回跳的 code，再决定要不要跳授权，最后拉数据。
  useEffect(() => {
    if (!token || bootedRef.current) return;
    bootedRef.current = true;
    const boot = async () => {
      // 回跳带回一次性 code：换成 JWT（设计 §1.1 的 code 落在群入口页时由本页兑换；
      // returnTo 直接回群入口页，不经过 WeChatCallback 页）。
      if (codeParam) {
        try {
          const result = await exchangeWeChatCode(codeParam);
          clearCodeFromUrl();
          if (result.kind === 'session') {
            setToken(result.token);
            setAuthed(true);
            // 用户信息尽量补齐，失败也不挡填报。
            authApi.me().then(setUser).catch(() => undefined);
          } else {
            // 未绑定：换到 bindTicket，但本页不跳绑定页（绑定成功后回 /dashboard，
            // 会丢群入口上下文），只提示匿名填报。
            setBindNotice('该微信尚未绑定账号，当前为匿名填报；绑定账号后可查看更多数据。');
          }
        } catch (err) {
          clearCodeFromUrl();
          setError(readErrorMessage(err, '微信登录 code 已失效，请重新从微信打开链接'));
        }
        load(dayjs());
        return;
      }
      // 微信内且无有效 JWT：跳一次静默授权；换到 JWT 后不再二次跳转。
      if (isWeChatInApp(navigator.userAgent) && !hasValidJwt(localStorage.getItem('token'))) {
        const search = new URLSearchParams({ token });
        if (groupParam) search.set('group', groupParam);
        const outcome = await startGroupSilentAuth(`/h5/group-capacity-entry?${search.toString()}`);
        if (outcome === 'unavailable') {
          setWechatNotice('微信登录未配置，仅可匿名填报');
        } else {
          // 已跳往微信授权，页面即将离开，不再拉数据。
          return;
        }
      }
      load(dayjs());
    };
    void boot();
    // 只在令牌变化时启动一次；改日期由日期控件单独触发。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedGroup = useMemo(
    () => view?.groups.find((group) => group.id === selectedGroupId) || view?.groups[0] || null,
    [view, selectedGroupId],
  );

  const employeeCount = useMemo(() => selectedGroup?.employees.length ?? 0, [selectedGroup]);

  const isAnonymous = !authed;

  const save = async () => {
    if (!view) return;
    const batches = view.groups.flatMap((group) => {
      const records: GroupSaveRecord[] = group.employees.flatMap((employee): GroupSaveRecord[] => {
        if (absentMap[employee.id]) return [{ employeeId: employee.id, absent: true as const }];
        const quantity = quantities[employee.id];
        if (quantity === null || quantity === undefined) return [];
        return [{ employeeId: employee.id, quantity, remark: remarks[employee.id] || '' }];
      });
      return records.length ? [{ groupId: group.id, records }] : [];
    });
    if (!batches.length) {
      message.warning('请至少填写一名员工的产量');
      return;
    }
    setSaving(true);
    try {
      let text = '保存成功';
      for (const batch of batches) {
        text = await groupEntryApi.save({
          token,
          date: date.format('YYYY-MM-DD'),
          groupId: batch.groupId,
          records: batch.records,
        });
      }
      message.success(text || '产量已保存');
    } catch (err) {
      message.error(readErrorMessage(err, '保存失败'));
    } finally {
      setSaving(false);
    }
  };

  const askAssistant = async (question: string) => {
    const text = question.trim();
    if (!text || asking || !token) return;
    lastQuestionRef.current = text;
    setChatInput('');
    setChatError('');
    setChatMessages((current) => [...current, { role: 'user', text }]);
    setAsking(true);
    try {
      const result = await assistantApi.chat({
        token,
        groupId: selectedGroup?.id || undefined,
        date: date.format('YYYY-MM-DD'),
        message: text,
      });
      setChatMessages((current) => [
        ...current,
        { role: 'assistant', text: result.answer, suggestions: result.suggestions, options: result.options },
      ]);
    } catch (err) {
      const hint = err instanceof ApiError && err.code === 4035 ? '请先绑定身份后再查询。' : '';
      setChatError(readErrorMessage(err, '助手暂时不可用') + hint);
    } finally {
      setAsking(false);
    }
  };

  // 歧义确认：把选中的候选项拼进原问题重问（组名可消歧；同名员工因规则解析只认名字，
  // 后端暂无 employeeId 消歧参数，重问后仍可能再次出现候选项，见 CHANGES）。
  const confirmOption = (option: AssistantOption) => {
    const picked = option.type === 'employee' && option.groupName ? `${option.groupName}的${option.name}` : option.name;
    void askAssistant(`${lastQuestionRef.current}（${picked}）`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '16px 16px calc(88px + env(safe-area-inset-bottom))' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, margin: '8px 0' }}>{view?.factoryName || '小组产量'}</h1>
        <p style={{ color: '#666', marginTop: 0 }}>填写今天每人的完成数量。请使用员工本人，不要填工号。</p>
        {!token && <Alert title="链接里没有入口令牌，请向管理员要新的群链接" type="error" showIcon />}
        {wechatNotice && <Alert title={wechatNotice} type="warning" showIcon style={{ marginBottom: 12 }} />}
        {bindNotice && <Alert title={bindNotice} type="info" showIcon style={{ marginBottom: 12 }} />}
        {isAnonymous && token && (
          <Alert title="匿名模式仅可查看当天" type="info" showIcon style={{ marginBottom: 12 }} />
        )}
        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 12 }} />}
        <div style={{ marginBottom: 12 }}>
          <DatePicker
            value={date}
            allowClear={false}
            inputReadOnly
            style={{ width: '100%' }}
            size="large"
            disabledDate={(current) => isAnonymous && !current.isSame(dayjs(), 'day')}
            onChange={(value) => {
              if (!value) return;
              if (isAnonymous && !value.isSame(dayjs(), 'day')) {
                setDate(dayjs());
                load(dayjs());
                return;
              }
              setDate(value);
              load(value);
            }}
          />
        </div>
        {view && view.groups.length > 1 && (
          <div style={{ marginBottom: 12 }}>
            <Select
              value={selectedGroup?.id}
              style={{ width: '100%' }}
              size="large"
              onChange={(value) => setSelectedGroupId(value)}
              options={view.groups.map((group) => ({ value: group.id, label: group.name }))}
            />
          </div>
        )}
        <Card title="AI 小助手（只查数，不录入）" size="small" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8, maxHeight: 240, overflowY: 'auto' }}>
            {chatMessages.length === 0 && (
              <div style={{ color: '#999' }}>可以问：今天一组做了多少、谁还没填、昨天一组做了多少。</div>
            )}
            {chatMessages.map((item, index) => (
              <div key={index}>
                <div style={{ textAlign: item.role === 'user' ? 'right' : 'left' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      background: item.role === 'user' ? '#e6f4ff' : '#f5f5f5',
                      borderRadius: 8,
                      padding: '6px 10px',
                      maxWidth: '90%',
                    }}
                  >
                    {item.text}
                  </span>
                </div>
                {item.suggestions && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {item.suggestions.map((suggestion) => (
                      <Button key={suggestion} size="small" onClick={() => void askAssistant(suggestion)}>
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                {item.options && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {item.options.map((option) => (
                      <Button
                        key={`${option.type}-${option.id}`}
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => confirmOption(option)}
                      >
                        {option.type === 'employee' && option.groupName ? `${option.name}（${option.groupName}）` : option.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {chatError && <Alert title={chatError} type="error" showIcon style={{ marginBottom: 8 }} />}
          <Input.Search
            placeholder="问问今天做了多少、谁还没填"
            enterButton="问一下"
            size="large"
            value={chatInput}
            loading={asking}
            onChange={(event) => setChatInput(event.target.value)}
            onSearch={(value) => void askAssistant(value)}
          />
        </Card>
        <Spin spinning={loading}>
          {view && employeeCount === 0 && <Alert title="这一天没有可填报的员工" type="info" showIcon />}
          {selectedGroup && (
            <section key={selectedGroup.id} style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, margin: '4px 0 12px' }}>{selectedGroup.name}</h2>
              {selectedGroup.employees.map((employee) => (
                <div key={employee.id} style={{ padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span>
                      <strong style={{ fontSize: 16 }}>{employee.name}</strong>
                      {employee.staffNo && <span style={{ display: 'block', color: '#999', fontSize: 12 }}>工号 {employee.staffNo}</span>}
                    </span>
                    <InputNumber
                      min={0}
                      inputMode="numeric"
                      size="large"
                      disabled={view?.editable === false || absentMap[employee.id] === true}
                      value={quantities[employee.id]}
                      style={{ width: 120, fontSize: 16 }}
                      onChange={(value) => setQuantities((current) => ({ ...current, [employee.id]: typeof value === 'number' ? value : null }))}
                    />
                  </label>
                  <Checkbox
                    checked={absentMap[employee.id] === true}
                    disabled={view?.editable === false}
                    onChange={(event) => setAbsentMap((current) => ({ ...current, [employee.id]: event.target.checked }))}
                  >
                    今日不上班
                  </Checkbox>
                </div>
              ))}
            </section>
          )}
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

/** 兑换成功或失败后都把一次性 code 从地址栏清掉，避免被转发或记入浏览器历史。 */
function clearCodeFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

export default GroupCapacityEntry;
