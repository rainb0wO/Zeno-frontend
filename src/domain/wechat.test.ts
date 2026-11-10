import { describe, expect, it } from 'vitest';
import {
  buildInviteBind,
  buildPasswordBind,
  isWeChatNotConfigured,
  readAuthorizeOutcome,
  readInviteLink,
  readWeChatBindings,
  readWeChatCallback,
  wechatAuthorizePlan,
} from './wechat';

describe('wechat authorize', () => {
  it('uses the official account inside WeChat and QR login on desktop', () => {
    expect(wechatAuthorizePlan('Mozilla/5.0 MicroMessenger/8.0')).toEqual({
      channel: 'mp',
      scope: 'snsapi_base',
    });
    expect(wechatAuthorizePlan('Mozilla/5.0 MicroMessenger/8.0', true).scope).toBe('snsapi_userinfo');
    expect(wechatAuthorizePlan('Mozilla/5.0 Chrome/120')).toEqual({
      channel: 'open',
      scope: 'snsapi_login',
    });
  });

  it('hides the button when the backend says it is not configured', () => {
    expect(isWeChatNotConfigured('微信开放平台未配置')).toBe(true);
    expect(readAuthorizeOutcome(null, '未配置')).toEqual({ configured: false, url: null });
    expect(readAuthorizeOutcome({ configured: false }, 'ok')).toEqual({ configured: false, url: null });
    expect(readAuthorizeOutcome({ authorizeUrl: 'https://open.weixin.qq.com/connect/oauth2' }, 'ok')).toEqual({
      configured: true,
      url: 'https://open.weixin.qq.com/connect/oauth2',
    });
  });

  it('splits a bound login from a bind ticket', () => {
    expect(readWeChatCallback(new URLSearchParams('token=jwt-1'))).toEqual({ kind: 'session', token: 'jwt-1' });
    expect(readWeChatCallback(new URLSearchParams('bindTicket=ticket-1'))).toEqual({ kind: 'bind', bindTicket: 'ticket-1' });
  });

  it('builds bind bodies and reads settings plus invite links', () => {
    expect(buildPasswordBind('t', ' demo ', 'secret')).toEqual({
      bindTicket: 't',
      username: 'demo',
      password: 'secret',
    });
    expect(buildInviteBind('t', 'inv')).toEqual({ bindTicket: 't', inviteToken: 'inv' });
    expect(readWeChatBindings({ mp: { bound: true, nickname: '张三' }, openBound: false })).toEqual({
      mp: { bound: true, nickname: '张三' },
      open: { bound: false, nickname: undefined },
    });
    expect(readInviteLink({ inviteToken: 'abc' }, 'https://zeno.asia')).toEqual({
      token: 'abc',
      url: 'https://zeno.asia/join?inviteToken=abc',
    });
  });
});
