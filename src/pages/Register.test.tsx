import { render, screen } from '@testing-library/react';
import { App as AntdApp, ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Register from './Register';

describe('Register', () => {
  it('用厂区名称注册，不再收集邮箱或验证码', () => {
    render(
      <ConfigProvider>
        <AntdApp>
          <MemoryRouter>
            <Register />
          </MemoryRouter>
        </AntdApp>
      </ConfigProvider>,
    );

    expect(screen.getByPlaceholderText('例如：城东制衣一厂')).toBeInTheDocument();
    expect(screen.queryByText('邮箱')).not.toBeInTheDocument();
    expect(screen.queryByText(/验证码/)).not.toBeInTheDocument();
    expect(screen.queryByText(/短信/)).not.toBeInTheDocument();
  });
});
