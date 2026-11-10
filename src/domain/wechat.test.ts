import { describe, expect, it } from 'vitest';
import {
  buildInviteBind,
  buildInviteRequest,
  buildPasswordBind,
  isWeChatUnavailable,
  readAuthorizeUrl,
  readInvite,
  readWeChatBindings,
  readWeChatCallback,
  wechatAuthorizePlan,
} from './wechat';

describe('wechat contract', () => {
  it('picks mp or open and only sends scope for the official account', () => {
    expect(wechatAuthorizePlan('MicroMessenger')).toEqual({ channel: 'mp', scope: 'snsapi_base' });
    expect(wechatAuthorizePlan('MicroMessenger', true)).toEqual({ channel: 'mp', scope: 'snsapi_userinfo' });
    expect(wechatAuthorizePlan('Chrome')).toEqual({ channel: 'open' });
  });

  it('reads url only, and treats 5031/5032 as not configured', () => {
    expect(readAuthorizeUrl({ url: 'https://open.weixin.qq.com/connect/oauth2' })).toBe('https://open.weixin.qq.com/connect/oauth2');
    expect(readAuthorizeUrl({})).toBeNull();
    expect(isWeChatUnavailable({ status: 503, code: 5031 })).toBe(true);
    expect(isWeChatUnavailable({ status: 503, code: 5032 })).toBe(true);
    expect(isWeChatUnavailable({ status: 500, code: 500 })).toBe(false);
  });

  it('302 query is token or bindTicket, and bind uses account', () => {
    expect(readWeChatCallback(new URLSearchParams('token=jwt-1'))).toEqual({ kind: 'session', token: 'jwt-1' });
    expect(readWeChatCallback(new URLSearchParams('bindTicket=ticket-1'))).toEqual({ kind: 'bind', bindTicket: 'ticket-1' });
    expect(readWeChatCallback(new URLSearchParams('accessToken=nope')).kind).toBe('missing');
    expect(buildPasswordBind('t', ' demo ', 'Demo1234')).toEqual({ bindTicket: 't', account: 'demo', password: 'Demo1234' });
    expect(buildInviteBind('t', 'inv')).toEqual({ bindTicket: 't', inviteToken: 'inv' });
  });

  it('invite role is only USER, HR or MANAGER, and settings use identities', () => {
    expect(buildInviteRequest('HR', 72)).toEqual({ role: 'HR', expiresInHours: 72 });
    expect(() => buildInviteRequest('ADMIN' as 'USER', 72)).toThrow('USER、HR 或 MANAGER');
    expect(readInvite({ inviteToken: 'abc', role: 'USER', expiresAt: '2026-11-13T00:00:00.000Z' })).toEqual({
      inviteToken: 'abc',
      role: 'USER',
      expiresAt: '2026-11-13T00:00:00.000Z',
    });
    expect(readWeChatBindings({
      identities: [{ provider: 'MP', nickname: '张三' }, { provider: 'OPEN', nickname: 'zhang' }],
    })).toEqual({
      mp: { bound: true, nickname: '张三' },
      open: { bound: true, nickname: 'zhang' },
    });
  });
});
