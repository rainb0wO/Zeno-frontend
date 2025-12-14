import { Skeleton, Card } from 'antd';
import React from 'react';

interface LoadingSkeletonProps {
  type?: 'table' | 'card' | 'form' | 'default';
  rows?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'default', rows = 5 }) => {
  if (type === 'table') {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton.Input active style={{ width: 200, marginBottom: 16 }} />
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} style={{ marginBottom: 12 }}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, padding: 24 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index} style={{ height: 200 }}>
            <Skeleton active />
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div style={{ padding: '24px', maxWidth: 600 }}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} style={{ marginBottom: 20 }}>
            <Skeleton.Input active style={{ width: 100, marginBottom: 8 }} size="small" />
            <Skeleton.Input active style={{ width: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  return <Skeleton active paragraph={{ rows }} />;
};

export default LoadingSkeleton;
