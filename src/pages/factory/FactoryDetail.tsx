import { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Space, Spin, message, Input, Divider } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { CopyOutlined, WechatOutlined } from '@ant-design/icons';
import { factoryApi } from '../../services/factory';
import { capacityApi } from '../../services/capacity';
import type { Factory } from '../../services/factory';
import { useReadonly } from '../../contexts/ReadonlyContext';

const FactoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadonly } = useReadonly();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [factory, setFactory] = useState<Factory & { groupEntryToken?: string } | null>(null);

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

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleGenerateToken = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      await capacityApi.generateGroupToken(id);
      message.success('链接生成成功');
      fetchDetail(); // 刷新详情以获取最新的 token
    } catch (e: any) {
      message.error('生成链接失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const entryUrl = factory?.groupEntryToken 
    ? `${window.location.origin}/h5/group-capacity-entry?token=${factory.groupEntryToken}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(entryUrl);
    message.success('链接已复制到剪贴板');
  };

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

            <Divider titlePlacement="left">微信群对接</Divider>
            
            <Card size="small" title={<span><WechatOutlined style={{ color: '#52c41a', marginRight: 8 }} />产能填报入口</span>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Alert 
                  message="将下方链接设为微信群公告，组长即可直接点开为全组登记每日产能数据。" 
                  type="info" 
                  showIcon 
                />
                
                <div style={{ marginTop: 8 }}>
                  {!factory.groupEntryToken ? (
                    <Button 
                      type="primary" 
                      icon={<WechatOutlined />} 
                      onClick={handleGenerateToken}
                      loading={generating}
                    >
                      生成群入口链接
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Input 
                          value={entryUrl} 
                          readOnly 
                          style={{ flex: 1, backgroundColor: '#f5f5f5' }}
                        />
                        <Button icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
                      </div>
                      <Button 
                        size="small" 
                        type="link" 
                        onClick={handleGenerateToken}
                        loading={generating}
                        style={{ alignSelf: 'flex-start', padding: 0 }}
                      >
                        重新生成链接
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Space>
        )}
      </Card>
    </div>
  );
};

export default FactoryDetail;
