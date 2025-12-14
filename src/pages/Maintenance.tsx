import React from 'react';
import { Result, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const Maintenance: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Result
        icon={<ToolOutlined style={{ fontSize: 72, color: '#fff' }} />}
        title={
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 600 }}>
            系统维护中
          </div>
        }
        subTitle={
          <div style={{ color: '#f0f0f0', fontSize: 16, marginTop: 16 }}>
            系统临时维护，登录/注册功能暂未开放
            <br />
            恢复时间另行通知，给您带来不便敬请谅解
          </div>
        }
        extra={
          <Button 
            type="primary" 
            size="large"
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderColor: '#fff',
              color: '#fff',
              marginTop: 20
            }}
          >
            刷新页面
          </Button>
        }
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          padding: '60px 40px',
          maxWidth: 600
        }}
      />
    </div>
  );
};

export default Maintenance;
