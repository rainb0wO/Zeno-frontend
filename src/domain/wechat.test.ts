import { describe, expect, it } from 'vitest';
import {
  buildInviteBind,
  buildInviteRequest,
  buildPasswordBind,
  hasValidJwt,
  isWeChatUnavailable,
  readAuthorizeUrl,
  readInvite,
  readWeChatBindings,
  readWeChatCallback,
  readWeChatCodeExchange,
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

  it('302 query 只带一次性 code，旧的 token / bindTicket 参数不再认，bind 用账号', () => {
    expect(readWeChatCallback(new URLSearchParams('code=abc123'))).toEqual({ kind: 'code', code: 'abc123' });
    expect(readWeChatCallback(new URLSearchParams('token=jwt-1')).kind).toBe('missing');
    expect(readWeChatCallback(new URLSearchParams('bindTicket=ticket-1')).kind).toBe('missing');
    expect(readWeChatCallback(new URLSearchParams('accessToken=nope')).kind).toBe('missing');
    expect(buildPasswordBind('t', ' demo ', 'Demo1234')).toEqual({ bindTicket: 't', account: 'demo', password: 'Demo1234' });
    expect(buildInviteBind('t', 'inv')).toEqual({ bindTicket: 't', inviteToken: 'inv' });
  });

  it('code-exchange 响应：已绑定给 JWT，未绑定给 bindTicket，缺了就报错', () => {
    expect(
      readWeChatCodeExchange({ token: 'jwt-1', user: { id: 'u1', username: 'zhangsf', role: 'MANAGER' } }),
    ).toEqual({ kind: 'session', token: 'jwt-1', user: { id: 'u1', username: 'zhangsf', role: 'MANAGER' } });
    expect(readWeChatCodeExchange({ bindTicket: 'ticket-1', bindRequired: true })).toEqual({
      kind: 'bind',
      bindTicket: 'ticket-1',
    });
    expect(() => readWeChatCodeExchange({})).toThrow('token 或 bindTicket');
    expect(() => readWeChatCodeExchange({ token: 'jwt-1' })).toThrow('token 或 bindTicket');
  });

  it('本地 JWT 有效性：只看 exp，未过期为真，过期/缺失/非法为假', () => {
    // payload {"exp": 9999999999}（未过期）与 {"exp": 1000000000}（已过期），签名位不校验。
    expect(hasValidJwt('eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJleHAiOiA5OTk5OTk5OTk5fQ.sig')).toBe(true);
    expect(hasValidJwt('Bearer eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJleHAiOiA5OTk5OTk5OTk5fQ.sig')).toBe(true);
    expect(hasValidJwt('eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJleHAiOiAxMDAwMDAwMDAwfQ.sig')).toBe(false);
    expect(hasValidJwt('')).toBe(false);
    expect(hasValidJwt(null)).toBe(false);
    expect(hasValidJwt('not-a-jwt')).toBe(false);
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
