import { useState } from 'react';
import { Alert, Button, Card, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { readErrorMessage } from '../domain/apiEnvelope';
import { bindWeChatAccount, clearInviteToken, readInviteToken } from '../services/wechatAuth';
import { useUserStore } from '../stores/userStore';

const WeChatBind = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();
  const bindTicket = params.get('bindTicket') || '';
  const inviteToken = params.get('inviteToken') || readInviteToken();
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [binding, setBinding] = useState(false);

  const finish = (session: { token: string; user: Parameters<typeof setUser>[0]; message: string }) => {
    clearInviteToken();
    setToken(session.token);
    setUser(session.user);
    message.success(session.message || '已绑定并登录');
    navigate('/dashboard', { replace: true });
  };

  const joinFactory = async () => {
    setJoining(true);
    setError('');
    try {
      finish(await bindWeChatAccount({ bindTicket, inviteToken }));
    } catch (err) {
      setError(readErrorMessage(err, '加入厂区失败'));
    } finally {
      setJoining(false);
    }
  };

  const bindAccount = async (values: { username: string; password: string }) => {
    setBinding(true);
    setError('');
    try {
      finish(await bindWeChatAccount({
        bindTicket,
        username: values.username,
        password: values.password,
      }));
    } catch (err) {
      setError(readErrorMessage(err, '绑定失败'));
    } finally {
      setBinding(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: 16 }}>
      <Card title="绑定微信" style={{ width: 420, maxWidth: '100%' }}>
        <p style={{ color: '#666' }}>这个微信还没有绑定账号。凭证 10 分钟内有效。</p>
        {!bindTicket && <Alert title="缺少绑定凭证，请重新从微信登录" type="error" showIcon style={{ marginBottom: 16 }} />}
        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        {inviteToken && (
          <Button type="primary" block size="large" disabled={!bindTicket} loading={joining} onClick={joinFactory} style={{ marginBottom: 16 }}>
            加入受邀厂区
          </Button>
        )}
        <Form layout="vertical" onFinish={bindAccount} requiredMark={false}>
          <Form.Item name="username" label="已有账号" rules={[{ required: true, message: '请输入用户名或手机号' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名或手机号" size="large" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Button htmlType="submit" block size="large" disabled={!bindTicket} loading={binding}>
            绑定已有账号
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default WeChatBind;
