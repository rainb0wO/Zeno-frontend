import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { readErrorMessage } from '../domain/apiEnvelope';
import { authApi } from '../services/auth';
import { consumeWeChatReturn, exchangeWeChatCode } from '../services/wechatAuth';
import { useUserStore } from '../stores/userStore';

/** 兑换成功后立即把一次性 code 从地址栏清掉，避免被转发或记入浏览器历史。 */
function clearCodeFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

const WeChatCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();
  const code = params.get('code') || '';
  const [exchangeError, setExchangeError] = useState('');
  // code 是一次性的：StrictMode 下 effect 会跑两遍，必须保证只兑换一次。
  const startedRef = useRef(false);
  const error = !code ? '微信没有返回登录 code，请重新从微信打开链接' : exchangeError;

  useEffect(() => {
    if (!code || startedRef.current) return;
    startedRef.current = true;
    let alive = true;
    exchangeWeChatCode(code)
      .then((result) => {
        if (!alive) return;
        clearCodeFromUrl();
        if (result.kind === 'bind') {
          // bindTicket 只走内存传递（路由 state），不放进 URL。
          navigate('/auth/wechat/bind', { replace: true, state: { bindTicket: result.bindTicket } });
          return;
        }
        setToken(result.token);
        return authApi.me().then((user) => {
          if (!alive) return;
          setUser(user);
          navigate(consumeWeChatReturn(), { replace: true });
        });
      })
      .catch((err) => {
        if (alive) setExchangeError(readErrorMessage(err, '微信登录 code 已失效，请重新从微信打开链接'));
      });
    return () => {
      alive = false;
    };
  }, [code, navigate, setToken, setUser]);

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
