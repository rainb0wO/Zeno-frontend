export const WECHAT_INVITE_KEY = 'zeno_wechat_invite';
export const WECHAT_RETURN_KEY = 'zeno_wechat_return';
export const WECHAT_RETURN_PATH = '/auth/wechat/callback';
export const BIND_TICKET_SECONDS = 600;

export type WeChatChannel = 'mp' | 'open';
export type InviteRole = 'USER' | 'HR' | 'MANAGER';

export const INVITE_ROLES: readonly InviteRole[] = ['USER', 'HR', 'MANAGER'];

export interface WeChatAuthorizePlan {
  channel: WeChatChannel;
  scope?: 'snsapi_base' | 'snsapi_userinfo';
}

export interface WeChatChannelStatus {
  bound: boolean;
  nickname?: string;
}

export interface WeChatBindings {
  mp: WeChatChannelStatus;
  open: WeChatChannelStatus;
}

export interface WeChatIdentity {
  provider: 'MP' | 'OPEN';
  nickname?: string;
  linkedByUnionId?: boolean;
  createdAt?: string;
}

export function isWeChatInApp(userAgent: string): boolean {
  return /MicroMessenger/i.test(userAgent);
}

export function wechatAuthorizePlan(userAgent: string, profile = false): WeChatAuthorizePlan {
  if (isWeChatInApp(userAgent)) {
    return { channel: 'mp', scope: profile ? 'snsapi_userinfo' : 'snsapi_base' };
  }
  return { channel: 'open' };
}

export function isWeChatUnavailable(error: { status?: number; code?: number }): boolean {
  return error.status === 503 || error.code === 5031 || error.code === 5032;
}

export function readAuthorizeUrl(body: { url?: unknown }): string | null {
  return typeof body.url === 'string' && body.url ? body.url : null;
}

export type WeChatCallback = { kind: 'code'; code: string } | { kind: 'missing' };

/** 302 到前端时，查询参数只带一个短期、一次性的 code；JWT / bindTicket 绝不进 URL。 */
export function readWeChatCallback(params: URLSearchParams): WeChatCallback {
  const code = params.get('code') || '';
  if (code) return { kind: 'code', code };
  return { kind: 'missing' };
}

export interface WeChatCodeExchangeUser {
  id: string;
  username: string;
  role: string;
}

export type WeChatCodeExchange =
  | { kind: 'session'; token: string; user: WeChatCodeExchangeUser }
  | { kind: 'bind'; bindTicket: string };

/** POST /api/auth/wechat/code-exchange 的响应：已绑定给 JWT，未绑定给 bindTicket。 */
export function readWeChatCodeExchange(body: {
  token?: unknown;
  user?: unknown;
  bindTicket?: unknown;
  bindRequired?: unknown;
}): WeChatCodeExchange {
  if (typeof body.bindTicket === 'string' && body.bindTicket) {
    return { kind: 'bind', bindTicket: body.bindTicket };
  }
  const user = body.user as WeChatCodeExchangeUser | undefined;
  if (typeof body.token === 'string' && body.token && user && typeof user.id === 'string') {
    return { kind: 'session', token: body.token, user };
  }
  throw new Error('code 兑换响应缺少 token 或 bindTicket');
}

export function buildPasswordBind(bindTicket: string, account: string, password: string) {
  return { bindTicket, account: account.trim(), password };
}

export function buildInviteBind(bindTicket: string, inviteToken: string) {
  return { bindTicket, inviteToken };
}

export function buildInviteRequest(role: InviteRole, expiresInHours: number) {
  if (!INVITE_ROLES.includes(role)) throw new Error('邀请角色只能是 USER、HR 或 MANAGER');
  if (!Number.isInteger(expiresInHours) || expiresInHours <= 0) throw new Error('有效小时数必须是正整数');
  return { role, expiresInHours };
}

export function readWeChatBindings(body: { identities?: WeChatIdentity[] }): WeChatBindings {
  const identities = Array.isArray(body.identities) ? body.identities : [];
  const mp = identities.find((item) => item.provider === 'MP');
  const open = identities.find((item) => item.provider === 'OPEN');
  return {
    mp: { bound: Boolean(mp), nickname: mp?.nickname },
    open: { bound: Boolean(open), nickname: open?.nickname },
  };
}

export function readInvite(body: { inviteToken?: unknown; role?: unknown; expiresAt?: unknown }) {
  if (typeof body.inviteToken !== 'string' || !body.inviteToken) throw new Error('响应缺少 inviteToken');
  if (body.role !== 'USER' && body.role !== 'HR' && body.role !== 'MANAGER') throw new Error('响应里的 role 不合法');
  if (typeof body.expiresAt !== 'string' || !body.expiresAt) throw new Error('响应缺少 expiresAt');
  return { inviteToken: body.inviteToken, role: body.role, expiresAt: body.expiresAt };
}

export function buildJoinLink(origin: string, inviteToken: string): string {
  const url = new URL('/join', origin);
  url.searchParams.set('inviteToken', inviteToken);
  return url.toString();
}
