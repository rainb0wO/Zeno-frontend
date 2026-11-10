import { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Input, Space, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { readErrorMessage } from '../../domain/apiEnvelope';
import { buildGroupEntryLink } from '../../domain/groupEntry';
import { useAccess } from '../../hooks/useAccess';
import { factoryApi, type Factory } from '../../services/factory';
import { createFactoryInvite } from '../../services/wechatAuth';

const FactoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAccess();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [link, setLink] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [queryId, setQueryId] = useState(id);

  if (id !== queryId) {
    setQueryId(id);
    setLoading(true);
    setError('');
    setFactory(null);
  }

  useEffect(() => {
    if (!id) return;
    let alive = true;
    factoryApi.get(id)
      .then((item) => { if (alive) setFactory(item); })
      .catch((err) => { if (alive) setError(readErrorMessage(err, '厂区不存在或无权查看')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  const invite = async () => {
    if (!id) return;
    try {
      const result = await createFactoryInvite(id, window.location.origin);
      if (!result.token && !result.url) {
        message.error('后端没有返回邀请链接');
        return;
      }
      setInviteLink(result.url);
      message.success(result.message || '邀请链接已生成');
    } catch (err) {
      message.error(readErrorMessage(err, '生成邀请失败'));
    }
  };

  const rotate = async () => {
    if (!id) return;
    try {
      const result = await factoryApi.rotateGroupToken(id);
      if (!result.token && !result.url) {
        message.error('后端没有返回新的群入口令牌');
        return;
      }
      const next = result.url || buildGroupEntryLink(window.location.origin, result.token);
      setLink(next);
      message.success(result.message || '旧链接已失效');
    } catch (err) {
      message.error(readErrorMessage(err, '轮换失败'));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>厂区详情</h1>
        <Button onClick={() => navigate('/factory')}>返回</Button>
      </div>
      {error && <Alert title={error} type="error" showIcon />}
      <Spin spinning={loading}>
        {factory && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="名称">{factory.name}</Descriptions.Item>
              <Descriptions.Item label="地址">{factory.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系人">{factory.contactPerson || '-'}</Descriptions.Item>
              <Descriptions.Item label="电话">{factory.contactPhone || '-'}</Descriptions.Item>
            </Descriptions>
            <Card title="微信群产量入口">
              <p>轮换后会签发新链接，之前发出的链接立即失效。</p>
              {isAdmin ? <Button type="primary" onClick={rotate}>轮换并获取链接</Button> : <Alert title="只有厂区管理员可以轮换群入口" type="info" showIcon />}
              {link && (
                <Input.TextArea style={{ marginTop: 12 }} value={link} readOnly autoSize />
              )}
            </Card>
            <Card title="成员管理">
              <p>生成邀请链接。对方用微信打开后，可以用邀请加入本厂，或绑定自己已有的账号。</p>
              {isAdmin ? <Button onClick={invite}>生成邀请链接</Button> : <Alert title="只有厂区管理员可以邀请成员" type="info" showIcon />}
              {inviteLink && <Input.TextArea style={{ marginTop: 12 }} value={inviteLink} readOnly autoSize />}
            </Card>
          </Space>
        )}
      </Spin>
    </div>
  );
};

export default FactoryDetail;
