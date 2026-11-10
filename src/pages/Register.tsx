import { useState } from 'react';
import { Alert, Button, Card, Form, Input, message } from 'antd';
import { BankOutlined, LockOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { readErrorMessage } from '../domain/apiEnvelope';
import { authApi } from '../services/auth';
import { useUserStore } from '../stores/userStore';

interface RegisterForm {
  factoryName: string;
  username: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const session = await authApi.register({
        factoryName: values.factoryName.trim(),
        username: values.username.trim(),
        password: values.password,
        phone: values.phone?.trim() || undefined,
      });
      setToken(session.token);
      setUser(session.user);
      message.success(session.message || '厂区已创建');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMsg(readErrorMessage(error, '注册失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5', padding: 16 }}>
      <Card title="注册厂区管理员" style={{ width: 420, maxWidth: '100%' }}>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="factoryName" label="厂区名称" rules={[{ required: true, message: '请输入厂区名称' }]}>
            <Input prefix={<BankOutlined />} placeholder="例如：城东制衣一厂" size="large" />
          </Form.Item>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用于登录" autoComplete="username" size="large" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号（选填，也可用来登录）"
            rules={[{
              validator(_, value) {
                if (!value || /^1\d{10}$/.test(value)) return Promise.resolve();
                return Promise.reject(new Error('请输入 11 位手机号'));
              },
            }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="选填" size="large" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="至少 6 位" autoComplete="new-password" size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="再次输入密码" size="large" />
          </Form.Item>
          {errorMsg && <Alert title={errorMsg} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            创建厂区并进入
          </Button>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          已有账号？ <Button type="link" onClick={() => navigate('/login')}>返回登录</Button>
        </div>
      </Card>
    </div>
  );
};

export default Register;
