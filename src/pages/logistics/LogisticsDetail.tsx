import { useEffect, useState, useMemo } from 'react';
import { Alert, Button, Card, Descriptions, Space, Spin, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import logisticsApi from '../../services/logistics';
import type { LogisticsRecord } from '../../services/logistics';
import { useReadonly } from '../../contexts/ReadonlyContext';

const LogisticsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadonly } = useReadonly();

  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<LogisticsRecord | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await logisticsApi.getLogisticsRecordById(id);
        setRecord(res.logisticsRecord);
      } catch (error: any) {
        message.error(error?.response?.data?.message || '获取物流记录详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const typeTag = useMemo(() => {
    if (!record) return null;
    const inbound = record.type === 'INBOUND';
    return <Tag color={inbound ? 'success' : 'error'}>{inbound ? '入库' : '出库'}</Tag>;
  }, [record]);

  const statusTag = useMemo(() => {
    if (!record) return null;
    const map: Record<string, string> = {
      PENDING: 'warning',
      IN_TRANSIT: 'processing',
      DELIVERED: 'success',
      CANCELLED: 'default'
    };
    return <Tag color={map[record.status] || 'default'}>{record.status}</Tag>;
  }, [record]);

  return (
    <div className="page-container logistics-container">
      <Card
        title={
          <Space size="middle">
            <span>物流记录详情</span>
            {typeTag}
            {statusTag}
          </Space>
        }
        extra={<Button onClick={() => navigate('/logistics')}>返回列表</Button>}
      >
        {isReadonly && (
          <Alert message="该业务操作请在电脑端网页完成" type="info" showIcon style={{ marginBottom: 12 }} />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin />
          </div>
        ) : !record ? (
          <div>未找到物流记录</div>
        ) : (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="产品名称">{record.productName}</Descriptions.Item>
            <Descriptions.Item label="数量">{record.quantity} 件</Descriptions.Item>
            <Descriptions.Item label="目的地">{record.destination}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(record.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{new Date(record.updatedAt).toLocaleString('zh-CN')}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default LogisticsDetail;
