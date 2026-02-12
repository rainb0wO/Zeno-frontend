import { useEffect, useMemo, useRef, useState } from 'react';
import { AutoComplete, Card, Form, Input, Button, message, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth';
import type { RegisterParams } from '../services/auth';
import companyApi from '../services/company';
import { useUserStore } from '../stores/userStore';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([]);
  const companySearchTimerRef = useRef<number | null>(null);
  const lastCompanyQueryRef = useRef<string>('');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setSmsCountdown((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [smsCountdown]);

  useEffect(() => {
    if (emailCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setEmailCountdown((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [emailCountdown]);

  const triggerCompanySearch = async (q: string) => {
    const query = q.trim();
    if (!query) {
      setCompanyOptions([]);
      return;
    }

    lastCompanyQueryRef.current = query;

    try {
      setCompanyLoading(true);
      const res = await companyApi.search(query);
      const items = Array.isArray(res?.items) ? res.items : [];
      setCompanyOptions(
        items.map((it) => ({
          value: it.name,
          label: it.name,
        }))
      );
    } catch {
      // 企业搜索目前为“预留接口”阶段：失败时不阻断注册，仅清空选项
      setCompanyOptions([]);
    } finally {
      setCompanyLoading(false);
    }
  };

  const onCompanySearch = (q: string) => {
    if (companySearchTimerRef.current) {
      window.clearTimeout(companySearchTimerRef.current);
    }

    companySearchTimerRef.current = window.setTimeout(() => {
      triggerCompanySearch(q);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (companySearchTimerRef.current) {
        window.clearTimeout(companySearchTimerRef.current);
      }
    };
  }, []);

  const onFinish = async (values: RegisterParams) => {
    setLoading(true);
    console.log('发送注册请求:', values);
    try {
      const response = await authApi.register(values);
      console.log('注册响应:', response);

      // 注册成功后自动登录
      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        message.success(response.message || '注册成功，正在跳转...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        message.success(response.message || '注册成功，请登录');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      console.error('错误响应:', error.response);
      message.error(error.response?.data?.message || '注册失败，请检查信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: '#f0f2f5' 
    }}>
      <Card title="注册账号" style={{ width: 360 }}>
        <Form
          name="register"
          initialValues={{}}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="companyName"
            rules={[{ required: true, message: '请输入企业名称!' }]}
          >
            <AutoComplete
              options={companyOptions}
              onSearch={onCompanySearch}
              placeholder="企业名称（输入可搜索）"
              notFoundContent={companyLoading ? '搜索中...' : null}
            >
              <Input prefix={<BankOutlined />} />
            </AutoComplete>
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { pattern: /^1\d{10}$/, message: '请输入有效的手机号!' }
            ]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input prefix={<PhoneOutlined />} placeholder="手机号（选填）" />
              <Button
                disabled={smsCountdown > 0}
                onClick={() => {
                  message.info('短信验证码功能待后端接入');
                  setSmsCountdown(60);
                }}
              >
                {smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码'}
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.phone !== next.phone}
          >
            {({ getFieldValue }) => {
              const phone = (getFieldValue('phone') || '').trim();
              if (!phone) return null;
              return (
                <Form.Item
                  name="smsCode"
                  rules={[{ required: true, message: '请输入手机验证码!' }]}
                >
                  <Input placeholder="手机验证码" />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input prefix={<MailOutlined />} placeholder="邮箱（选填）" />
              <Button
                disabled={emailCountdown > 0}
                onClick={() => {
                  message.info('邮箱验证码功能待后端接入');
                  setEmailCountdown(60);
                }}
              >
                {emailCountdown > 0 ? `${emailCountdown}s` : '发送验证码'}
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.email !== next.email}
          >
            {({ getFieldValue }) => {
              const email = (getFieldValue('email') || '').trim();
              if (!email) return null;
              return (
                <Form.Item
                  name="emailCode"
                  rules={[{ required: true, message: '请输入邮箱验证码!' }]}
                >
                  <Input placeholder="邮箱验证码" />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
          <Divider />
          <div style={{ textAlign: 'center' }}>
            已有账号？ <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              立即登录
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
