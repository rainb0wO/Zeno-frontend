import { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Space, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { factoryApi } from '../../services/factory';
import type { Factory } from '../../services/factory';
import { useReadonly } from '../../contexts/ReadonlyContext';

const FactoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadonly } = useReadonly();

  const [loading, setLoading] = useState(false);
  const [factory, setFactory] = useState<Factory | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await factoryApi.getFactoryById(id);
        setFactory(res.factory);
      } catch (e: any) {
        message.error(e?.response?.data?.message || '获取厂区详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return (
    <div className="page-container">
      <Card title="厂区详情" extra={<Button onClick={() => navigate('/factory')}>返回列表</Button>}>
        {isReadonly && (
          <Alert
            message="该业务操作请在电脑端网页完成"
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
          />
        )}

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <Spin />
          </div>
        ) : !factory ? (
          <div>未找到该厂区</div>
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="厂区名称">{factory.name}</Descriptions.Item>
              <Descriptions.Item label="地址">{factory.address}</Descriptions.Item>
              <Descriptions.Item label="联系人">{factory.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{factory.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="管理模式">{factory.managementMode}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(factory.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
            </Descriptions>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default FactoryDetail;
