import { useEffect, useState } from 'react';
import { Alert, Button, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { readErrorMessage } from '../domain/apiEnvelope';
import { readWeChatCallback } from '../domain/wechat';
import { authApi } from '../services/auth';
import { consumeWeChatReturn } from '../services/wechatAuth';
import { useUserStore } from '../stores/userStore';

const WeChatCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();
  const query = params.toString();
  const result = readWeChatCallback(params);
  const [sessionError, setSessionError] = useState('');
  const error = result.kind === 'error' ? result.message : sessionError;

  useEffect(() => {
    const current = readWeChatCallback(new URLSearchParams(query));
    if (current.kind === 'bind') {
      navigate(`/auth/wechat/bind?bindTicket=${encodeURIComponent(current.bindTicket)}`, { replace: true });
      return;
    }
    if (current.kind !== 'session') return;
    let alive = true;
    setToken(current.token);
    authApi.me()
      .then((user) => {
        if (!alive) return;
        setUser(user);
        navigate(consumeWeChatReturn(), { replace: true });
      })
      .catch((err) => {
        if (alive) setSessionError(readErrorMessage(err, '微信登录成功，但没有取到用户信息'));
      });
    return () => {
      alive = false;
    };
  }, [navigate, query, setToken, setUser]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {error ? (
        <Alert
          type="error"
          showIcon
          title={error}
          action={<Button size="small" onClick={() => navigate('/login', { replace: true })}>返回登录</Button>}
        />
      ) : (
        <Spin tip="正在完成微信登录" />
      )}
    </div>
  );
};

export default WeChatCallback;
