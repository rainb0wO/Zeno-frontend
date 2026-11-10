import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import WeChatLoginEntry from '../components/WeChatLoginEntry';
import { readErrorMessage } from '../domain/apiEnvelope';
import { authApi } from '../services/auth';
import { prepareWeChatLogin, redirectToWeChat } from '../services/wechatAuth';
import { useUserStore } from '../stores/userStore';

interface LoginForm {
  username: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [wechatUrl, setWechatUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    prepareWeChatLogin()
      .then((option) => {
        if (alive) setWechatUrl(option.enabled ? option.url : null);
      })
      .catch(() => {
        if (alive) setWechatUrl(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const session = await authApi.login({
        username: values.username.trim(),
        password: values.password,
      });
      setToken(session.token);
      setUser(session.user);
      message.success(session.message || '登录成功');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMsg(readErrorMessage(error, '登录失败，请检查用户名或密码'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5', padding: 16 }}>
      <Card title="Zeno 生产辅助管理平台" style={{ width: 380, maxWidth: '100%' }}>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="username"
            label="用户名或手机号"
            rules={[{ required: true, message: '请输入用户名或手机号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名或手机号" autoComplete="username" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="current-password" size="large" />
          </Form.Item>
          {errorMsg && (
            <Alert title={errorMsg} type="error" showIcon style={{ marginBottom: 16 }} />
          )}
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            登录
          </Button>
        </Form>
        <WeChatLoginEntry enabled={Boolean(wechatUrl)} onLogin={() => { if (wechatUrl) redirectToWeChat(wechatUrl); }} />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          还没有厂区？ <Button type="link" onClick={() => navigate('/register')}>注册并创建厂区</Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
