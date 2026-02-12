import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Alert, Segmented, Space } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth';
import type { LoginParams } from '../services/auth';
import { useUserStore } from '../stores/userStore';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'sms'>('password');
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setSmsCountdown((v) => (v <= 1 ? 0 : v - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [smsCountdown]);
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();

  const onFinish = async (values: LoginParams) => {
    setLoading(true);
    setErrorMsg(''); // 清空之前的错误提示
    try {
      // 直接使用后端登录接口
      const response = await authApi.login(values);
      
      console.log('登录响应:', response);
      
      // 先设置token，再设置user，确保状态一致性
      setToken(response.token);
      setUser(response.user);
      
      // 验证状态是否持久化
      console.log('登录后状态:', { 
        token: response.token, 
        user: response.user,
        isAuthenticated: true 
      });
      
      message.success(response.message || '登录成功');
      
      // 使用setTimeout确保状态持久化完成后再跳转
      setTimeout(() => {
        console.log('即将跳转到 /dashboard');
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (error: any) {
      console.error('登录失败:', error);
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;
      const statusCode = error.response?.status;
      
      // 维护模式错误：跳转到维护页面
      if (errorCode === 1003) {
        navigate('/maintenance', { replace: true });
        return;
      }
      
      // 502 Bad Gateway 错误：后端服务不可用
      if (statusCode === 502) {
        setErrorMsg('服务器暂时不可用，请稍后重试。如果问题持续，请联系管理员。');
        // 502错误不自动清除，让用户知道问题严重性
        return;
      }
      
      // 503 Service Unavailable 错误：服务不可用
      if (statusCode === 503) {
        setErrorMsg('服务暂时不可用，请稍后重试');
        return;
      }
      
      // 网络连接错误
      if (!error.response) {
        setErrorMsg('网络连接失败，请检查网络设置');
        setTimeout(() => setErrorMsg(''), 5000);
        return;
      }
      
      // 根据错误码显示精准提示
      if (errorCode === 1001) {
        setErrorMsg('该账号尚未注册');
      } else if (errorCode === 1002) {
        setErrorMsg('密码错误');
      } else {
        setErrorMsg(errorMessage || '登录失败，请检查网络连接');
      }
      
      // 3秒后自动清除提示
      setTimeout(() => setErrorMsg(''), 3000);
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
      <Card title="Zeno生产辅助管理平台" style={{ width: 360 }}>
        <Segmented
          block
          value={loginMode}
          options={[
            { label: '账号密码', value: 'password' },
            { label: '短信验证码', value: 'sms' },
          ]}
          onChange={(v) => {
            setErrorMsg('');
            setLoginMode(v as 'password' | 'sms');
          }}
          style={{ marginBottom: 16 }}
        />

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          {loginMode === 'password' ? (
            <>
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号!' },
                  { pattern: /^1\d{10}$/, message: '请输入有效的手机号!' },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="手机号" />
              </Form.Item>
              <Form.Item>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="smsCode" noStyle rules={[{ required: true, message: '请输入验证码!' }]}>
                    <Input placeholder="验证码" />
                  </Form.Item>
                  <Button
                    disabled={smsCountdown > 0}
                    onClick={() => {
                      message.info('短信验证码登录待后端接入');
                      setSmsCountdown(60);
                    }}
                  >
                    {smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码'}
                  </Button>
                </Space.Compact>
              </Form.Item>
            </>
          )}

          {errorMsg && (
            <Form.Item>
              <Alert 
                title={errorMsg} 
                type="error" 
                showIcon 
                closable 
                onClose={() => setErrorMsg('')}
                style={{ marginBottom: 16 }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
                注册账号
              </a>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
