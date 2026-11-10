export const WECHAT_INVITE_KEY = 'zeno_wechat_invite';
export const WECHAT_RETURN_KEY = 'zeno_wechat_return';

export type WeChatChannel = 'mp' | 'open';

export interface WeChatAuthorizePlan {
  channel: WeChatChannel;
  scope: 'snsapi_base' | 'snsapi_userinfo' | 'snsapi_login';
}

export interface WeChatAuthorizeOutcome {
  configured: boolean;
  url: string | null;
}

export interface WeChatChannelStatus {
  bound: boolean;
  nickname?: string;
}

export interface WeChatBindings {
  mp: WeChatChannelStatus;
  open: WeChatChannelStatus;
}

export function isWeChatInApp(userAgent: string): boolean {
  return /MicroMessenger/i.test(userAgent);
}

/** 微信内走公众号网页授权，电脑走开放平台扫码。 */
export function wechatAuthorizePlan(userAgent: string, profile = false): WeChatAuthorizePlan {
  if (isWeChatInApp(userAgent)) {
    return { channel: 'mp', scope: profile ? 'snsapi_userinfo' : 'snsapi_base' };
  }
  return { channel: 'open', scope: 'snsapi_login' };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function isWeChatNotConfigured(message: string): boolean {
  return message.includes('未配置');
}

export function readAuthorizeOutcome(data: unknown, message = ''): WeChatAuthorizeOutcome {
  if (isWeChatNotConfigured(message)) return { configured: false, url: null };
  if (typeof data === 'string') {
    return data.startsWith('http') ? { configured: true, url: data } : { configured: false, url: null };
  }
  const body = asRecord(data);
  if (body.configured === false || isWeChatNotConfigured(String(body.message || ''))) {
    return { configured: false, url: null };
  }
  const candidates = [body.url, body.authorizeUrl, body.redirectUrl, body.authorizationUrl];
  const url = candidates.find((item) => typeof item === 'string' && item.length > 0);
  if (typeof url !== 'string') return { configured: false, url: null };
  return { configured: true, url };
}

export type WeChatCallback =
  | { kind: 'session'; token: string }
  | { kind: 'bind'; bindTicket: string }
  | { kind: 'error'; message: string };

export function readWeChatCallback(params: URLSearchParams): WeChatCallback {
  const token = params.get('token') || params.get('accessToken') || '';
  const bindTicket = params.get('bindTicket') || '';
  const error = params.get('message') || params.get('error') || '';
  if (token) return { kind: 'session', token };
  if (bindTicket) return { kind: 'bind', bindTicket };
  if (error) return { kind: 'error', message: error };
  return { kind: 'error', message: '微信没有返回登录结果' };
}

export function buildPasswordBind(bindTicket: string, username: string, password: string) {
  return { bindTicket, username: username.trim(), password };
}

export function buildInviteBind(bindTicket: string, inviteToken: string) {
  return { bindTicket, inviteToken };
}

function readSide(value: unknown, fallback: unknown, nickname: unknown): WeChatChannelStatus {
  if (typeof value === 'boolean') return { bound: value };
  if (value && typeof value === 'object') {
    const side = value as Record<string, unknown>;
    const bound = side.bound === true || typeof side.openid === 'string';
    return {
      bound,
      nickname: typeof side.nickname === 'string' ? side.nickname : undefined,
    };
  }
  return {
    bound: fallback === true,
    nickname: typeof nickname === 'string' ? nickname : undefined,
  };
}

export function readWeChatBindings(data: unknown): WeChatBindings {
  const body = asRecord(data);
  return {
    mp: readSide(body.mp, body.mpBound, body.mpNickname),
    open: readSide(body.open, body.openBound, body.openNickname),
  };
}

export function readInviteLink(data: unknown, origin: string): { token: string; url: string } {
  const body = asRecord(data);
  const tokenValue = body.inviteToken ?? body.token;
  const token = typeof tokenValue === 'string' ? tokenValue : '';
  const explicit = body.url ?? body.link;
  const url = typeof explicit === 'string' && explicit
    ? explicit
    : `${origin.replace(/\/$/, '')}/join?inviteToken=${encodeURIComponent(token)}`;
  return { token, url };
}
