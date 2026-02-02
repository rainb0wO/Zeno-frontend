import { useEffect, useMemo, useState } from 'react';
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
      } catch (e: any) {
        message.error(e?.response?.data?.message || '获取物流记录详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const typeTag = useMemo(() => {
    const t = record?.type;
    if (!t) return null;
    return <Tag color={t === 'INBOUND' ? 'success' : 'error'}>{t === 'INBOUND' ? '入库' : '出库'}</Tag>;
  }, [record?.type]);

  const statusTag = useMemo(() => {
    const s = record?.status;
    if (!s) return null;
    const map: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'warning', text: '待处理' },
      IN_TRANSIT: { color: 'processing', text: '运输中' },
      DELIVERED: { color: 'success', text: '已完成' },
      CANCELLED: { color: 'default', text: '已取消' }
    };
    const cfg = map[s] || { color: 'default', text: s };
    return <Tag color={cfg.color}>{cfg.text}</Tag>;
  }, [record?.status]);

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
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <Spin />
          </div>
        ) : !record ? (
          <div>未找到该物流记录</div>
        ) : (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="产品名称">{record.productName || '-'}</Descriptions.Item>
            <Descriptions.Item label="数量">{record.quantity} 件</Descriptions.Item>
            <Descriptions.Item label="目的地">{record.destination || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(record.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{new Date(record.updatedAt).toLocaleString('zh-CN')}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default LogisticsDetail;

