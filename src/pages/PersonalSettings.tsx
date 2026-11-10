import { useEffect, useState } from 'react';
import { Alert, Button, Card, Space, Spin, message } from 'antd';
import { readErrorMessage } from '../domain/apiEnvelope';
import type { WeChatBindings, WeChatChannel } from '../domain/wechat';
import { isWeChatInApp } from '../domain/wechat';
import { startWeChatBind, wechatSettingsApi } from '../services/wechatAuth';

const empty: WeChatBindings = {
  mp: { bound: false },
  open: { bound: false },
};

const PersonalSettings = () => {
  const [status, setStatus] = useState<WeChatBindings>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const inWeChat = isWeChatInApp(navigator.userAgent);

  const load = () => {
    setLoading(true);
    wechatSettingsApi.get()
      .then(setStatus)
      .catch((err) => setError(readErrorMessage(err, '微信绑定状态加载失败')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let alive = true;
    wechatSettingsApi.get()
      .then((value) => { if (alive) setStatus(value); })
      .catch((err) => { if (alive) setError(readErrorMessage(err, '微信绑定状态加载失败')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const unbind = async (channel: WeChatChannel) => {
    try {
      message.success(await wechatSettingsApi.unbind(channel));
      load();
    } catch (err) {
      message.error(readErrorMessage(err, '解绑失败'));
    }
  };

  const bind = async (channel: WeChatChannel) => {
    try {
      await startWeChatBind(channel);
    } catch (err) {
      message.error(readErrorMessage(err, '微信登录未配置'));
    }
  };

  const row = (channel: WeChatChannel, title: string) => {
    const item = status[channel];
    return (
      <Card key={channel} size="small" title={title}>
        <p>{item.bound ? `已绑定${item.nickname ? `：${item.nickname}` : ''}` : '未绑定'}</p>
        <Space wrap>
          {item.bound ? (
            <Button danger onClick={() => unbind(channel)}>解绑</Button>
          ) : (
            <Button type="primary" onClick={() => bind(channel)}>
              {channel === 'mp' ? '在微信内绑定' : '电脑扫码绑定'}
            </Button>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>个人设置</h1></div>
      <p style={{ color: '#666' }}>
        {inWeChat ? '当前在微信里打开，适合绑定公众号。' : '当前在电脑浏览器，适合扫码绑定开放平台。'}
        绑定会带着登录凭证跳去微信授权。
      </p>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Spin spinning={loading}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {row('mp', '公众号')}
          {row('open', '开放平台')}
        </Space>
      </Spin>
    </div>
  );
};

export default PersonalSettings;
