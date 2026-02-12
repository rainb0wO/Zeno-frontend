import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Progress, Space, Spin, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { capacityApi } from '../../services/capacity';
import type { ProductionPlan } from '../../services/capacity';
import { useReadonly } from '../../contexts/ReadonlyContext';

const CapacityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadonly, showTip } = useReadonly();

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res: any = await capacityApi.getProductionPlanById(id);
        const p = res?.productionPlan || res?.plan || res?.data?.productionPlan || res?.data?.plan || null;
        setPlan(p);
      } catch (e: any) {
        message.error(e?.response?.data?.message || '获取生产计划详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const statusTag = useMemo(() => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'default', text: '待开始' },
      IN_PROGRESS: { color: 'processing', text: '进行中' },
      COMPLETED: { color: 'success', text: '已完成' },
      DELAYED: { color: 'error', text: '延期' }
    };
    const s = plan?.status;
    const cfg = statusMap[s || ''] || { color: 'default', text: s || '-' };
    return <Tag color={cfg.color}>{cfg.text}</Tag>;
  }, [plan?.status]);

  return (
    <div className="page-container">
      <Card
        title={
          <Space size="middle">
            <span>生产计划详情</span>
            {statusTag}
          </Space>
        }
        extra={<Button onClick={() => navigate('/capacity')}>返回列表</Button>}
      >
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
        ) : !plan ? (
          <div>未找到该生产计划</div>
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>{plan.productName}</div>
              <Progress percent={plan.progress || 0} />
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="目标产量">{plan.targetQty}</Descriptions.Item>
              <Descriptions.Item label="实际产量">{plan.actualQty || 0}</Descriptions.Item>
              <Descriptions.Item label="开始日期">{plan.startDate}</Descriptions.Item>
              <Descriptions.Item label="结束日期">{plan.endDate}</Descriptions.Item>
            </Descriptions>

            <Space>
              {!isReadonly && (
                <Button
                  type="primary"
                  onClick={() => {
                    navigate(`/capacity?edit=${id}`);
                  }}
                >
                  编辑
                </Button>
              )}
            </Space>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default CapacityDetail;

