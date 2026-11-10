import { render, screen } from '@testing-library/react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Login from './Login';

describe('Login', () => {
  it('只保留用户名或手机号加密码，并隐藏未开通的微信登录', async () => {
    render(
      <ConfigProvider>
        <AntdApp>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </AntdApp>
      </ConfigProvider>,
    );

    expect(await screen.findByPlaceholderText('用户名或手机号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
    expect(screen.queryByText('短信验证码')).not.toBeInTheDocument();
    expect(screen.queryByText('邮箱')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '微信登录' })).not.toBeInTheDocument();
  });
});
