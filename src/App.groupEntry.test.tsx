import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const init = vi.hoisted(() => vi.fn());

vi.mock('./services/groupEntry', () => ({
  groupEntryApi: {
    init: (...args: unknown[]) => init(...args),
    save: vi.fn(),
  },
}));

import App from './App';

describe('group entry route', () => {
  beforeEach(() => {
    init.mockReset();
    init.mockResolvedValue({
      factoryName: '一厂',
      date: '2026-11-10',
      editable: true,
      groups: [],
    });
    window.history.pushState({}, '', '/h5/group-capacity-entry?token=group-token');
  });

  it('does not treat the group token as a WeChat login', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: '一厂' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/h5/group-capacity-entry');
    expect(window.location.search).toContain('token=group-token');
    expect(screen.queryByText('微信没有返回 token 或 bindTicket')).not.toBeInTheDocument();
    expect(init).toHaveBeenCalledWith('group-token', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });
});
