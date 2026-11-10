import { render, screen } from '@testing-library/react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';

const { prepareWeChatLogin } = vi.hoisted(() => ({
  prepareWeChatLogin: vi.fn(),
}));

vi.mock('../services/wechatAuth', () => ({
  prepareWeChatLogin,
  redirectToWeChat: vi.fn(),
}));

function renderLogin() {
  return render(
    <ConfigProvider>
      <AntdApp>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AntdApp>
    </ConfigProvider>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    prepareWeChatLogin.mockReset();
  });

  it('只保留用户名或手机号加密码，接口未配置时隐藏微信登录', async () => {
    prepareWeChatLogin.mockResolvedValue({ enabled: false, url: null, channel: 'open' });
    renderLogin();

    expect(await screen.findByPlaceholderText('用户名或手机号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
    expect(screen.queryByText('短信验证码')).not.toBeInTheDocument();
    expect(screen.queryByText('邮箱')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '微信登录' })).not.toBeInTheDocument();
  });

  it('后端返回授权地址时显示微信登录', async () => {
    prepareWeChatLogin.mockResolvedValue({
      enabled: true,
      url: 'https://open.weixin.qq.com/connect/qrconnect',
      channel: 'open',
    });
    renderLogin();
    expect(await screen.findByRole('button', { name: /微信登录/ })).toBeInTheDocument();
  });
});
