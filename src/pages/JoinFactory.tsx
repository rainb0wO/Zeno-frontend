import { useState } from 'react';
import { Alert, Button, Card } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { readErrorMessage } from '../domain/apiEnvelope';
import { prepareWeChatLogin, redirectToWeChat, rememberInviteToken } from '../services/wechatAuth';

const JoinFactory = () => {
  const [params] = useSearchParams();
  const inviteToken = params.get('inviteToken') || '';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const start = async () => {
    if (!inviteToken) {
      setError('邀请链接缺少 inviteToken');
      return;
    }
    setLoading(true);
    setError('');
    try {
      rememberInviteToken(inviteToken);
      const option = await prepareWeChatLogin();
      if (!option.enabled || !option.url) {
        setError('微信登录未配置，暂时不能用邀请链接加入');
        return;
      }
      redirectToWeChat(option.url);
    } catch (err) {
      setError(readErrorMessage(err, '无法开始微信授权'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: 16 }}>
      <Card title="加入厂区" style={{ width: 420, maxWidth: '100%' }}>
        <p>管理员邀请你加入厂区。微信授权后，如果还没有账号，可以用这张邀请加入；如果已有账号，再输入密码完成绑定。</p>
        {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Button type="primary" block size="large" disabled={!inviteToken} loading={loading} onClick={start}>
          使用微信继续
        </Button>
      </Card>
    </div>
  );
};

export default JoinFactory;
