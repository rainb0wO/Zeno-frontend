import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Modal, Switch, Upload, Space, Select } from 'antd';
import { UserOutlined, LockOutlined, BellOutlined, UploadOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { settingsApi, type PersonalInfo, type Notifications } from '../services/settings';
import { useNavigate } from 'react-router-dom';

const PersonalSettings = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notifications>({
    orderProgress: true,
    scheduleChange: true,
    pieceWorkAudit: true,
    capacityAlert: true
  });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsApi.getUserSettings();
      console.log('获取设置响应:', res);
      // response 直接是 data 对象
      if (res?.settings) {
        if (res.settings.personalInfo) {
          form.setFieldsValue(res.settings.personalInfo);
        }
        if (res.settings.notifications) {
          setNotifications(res.settings.notifications);
        }
      } else {
        console.warn('设置数据为空，使用默认值');
      }
    } catch (error: any) {
      console.error('加载设置失败:', error);
      const errMsg = error.response?.data?.message || error.message || '加载设置失败';
      message.error(errMsg);
    }
  };

  // 更新个人信息
  const handleUpdateInfo = async (values: PersonalInfo) => {
    setLoading(true);
    try {
      await settingsApi.updatePersonalInfo(values);
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (values: any) => {
    try {
      await settingsApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('密码修改成功，请重新登录');
      setPasswordModalVisible(false);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      message.error(error.response?.data?.message || '修改失败');
    }
  };

  // 更新通知设置
  const handleNotificationChange = async (key: keyof Notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    try {
      await settingsApi.updateNotifications(newNotifications);
      message.success('通知设置已更新');
    } catch (error) {
      message.error('更新失败');
      setNotifications(notifications);
    }
  };

  // 恢复默认通知设置
  const handleResetNotifications = async () => {
    Modal.confirm({
      title: '确认恢复默认设置',
      content: '将恢复所有通知为默认状态，是否继续？',
      onOk: async () => {
        try {
          await settingsApi.resetNotifications();
          const defaultNotifications = {
            orderProgress: true,
            scheduleChange: true,
            pieceWorkAudit: true,
            capacityAlert: true
          };
          setNotifications(defaultNotifications);
          message.success('已恢复默认通知设置');
        } catch (error) {
          message.error('恢复失败');
        }
      }
    });
  };

  // 头像上传
  const handleAvatarUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return false;
    }
    
    // TODO: 实际项目中应该上传到服务器
    const reader = new FileReader();
    reader.onload = (e) => {
      const avatar = e.target?.result as string;
      form.setFieldValue('avatar', avatar);
      message.success('头像上传成功');
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>个人设置</h1>

      {/* 个人信息 */}
      <Card title={<><UserOutlined /> 个人信息</>} style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateInfo}
        >
          <Form.Item label="头像" name="avatar">
            <Space>
              {form.getFieldValue('avatar') && (
                <img src={form.getFieldValue('avatar')} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%' }} />
              )}
              <Upload
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
              >
                <Button icon={<UploadOutlined />}>上传头像</Button>
              </Upload>
            </Space>
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="所属厂区" name="factoryId">
            <Select placeholder="请选择厂区">
              <Select.Option value="1">深圳厂区</Select.Option>
              <Select.Option value="2">广州厂区</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 账号安全 */}
      <Card title={<><LockOutlined /> 账号安全</>} style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={() => setPasswordModalVisible(true)}>
          修改密码
        </Button>

        <Modal
          title="修改密码"
          open={passwordModalVisible}
          onCancel={() => {
            setPasswordModalVisible(false);
            passwordForm.resetFields();
          }}
          onOk={() => passwordForm.submit()}
          okText="确认修改"
          cancelText="取消"
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              label="原密码"
              name="oldPassword"
              rules={[{ required: true, message: '请输入原密码' }]}
            >
              <Input.Password placeholder="请输入原密码" />
            </Form.Item>

            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>

            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次密码输入不一致'));
                  }
                })
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>

      {/* 个性化提醒 */}
      <Card 
        title={<><BellOutlined /> 个性化提醒</>}
        extra={
          <Button type="link" icon={<UndoOutlined />} onClick={handleResetNotifications}>
            恢复默认
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>订单进度提醒</span>
            <Switch
              checked={notifications.orderProgress}
              onChange={(checked) => handleNotificationChange('orderProgress', checked)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>排班调整提醒</span>
            <Switch
              checked={notifications.scheduleChange}
              onChange={(checked) => handleNotificationChange('scheduleChange', checked)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>计件数据审核提醒</span>
            <Switch
              checked={notifications.pieceWorkAudit}
              onChange={(checked) => handleNotificationChange('pieceWorkAudit', checked)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>产能异常提醒</span>
            <Switch
              checked={notifications.capacityAlert}
              onChange={(checked) => handleNotificationChange('capacityAlert', checked)}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default PersonalSettings;
