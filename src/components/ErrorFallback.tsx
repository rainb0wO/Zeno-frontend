import React from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ErrorFallbackProps {
  error?: Error | string;
  onRetry?: () => void;
  type?: 'network' | 'permission' | 'notfound' | 'server' | 'default';
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  type = 'default',
  message
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          status: '500' as const,
          title: '网络连接失败',
          subTitle: message || '无法连接到服务器，请检查网络连接'
        };
      case 'permission':
        return {
          status: '403' as const,
          title: '无权访问',
          subTitle: message || '您没有权限访问此资源'
        };
      case 'notfound':
        return {
          status: '404' as const,
          title: '页面未找到',
          subTitle: message || '您访问的页面不存在'
        };
      case 'server':
        return {
          status: 'error' as const,
          title: '服务器错误',
          subTitle: message || '服务器处理请求时出现问题'
        };
      default:
        return {
          status: 'warning' as const,
          title: '数据加载失败',
          subTitle: message || (error instanceof Error ? error.message : error) || '请稍后重试'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '400px',
      padding: '24px'
    }}>
      <Result
        status={config.status}
        title={config.title}
        subTitle={config.subTitle}
        extra={
          onRetry && (
            <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
              点击重试
            </Button>
          )
        }
      />
    </div>
  );
};

export default ErrorFallback;
