import { useState } from 'react';
import { Card, Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth';
import type { RegisterParams } from '../services/auth';
import { useUserStore } from '../stores/userStore';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();

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
            name="email"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱（选填）" />
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
