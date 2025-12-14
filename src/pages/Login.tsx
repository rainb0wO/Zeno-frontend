import { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth';
import type { LoginParams } from '../services/auth';
import { useUserStore } from '../stores/userStore';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
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
      
      // 维护模式错误：跳转到维护页面
      if (errorCode === 1003) {
        navigate('/maintenance', { replace: true });
        return;
      }
      
      // 维护模式错误：跳转到维护页面
      if (errorCode === 1003) {
        navigate('/maintenance', { replace: true });
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
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
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
