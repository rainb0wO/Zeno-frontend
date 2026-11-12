import { ApiError } from '../domain/apiEnvelope';
import {
  WECHAT_INVITE_KEY,
  WECHAT_RETURN_KEY,
  WECHAT_RETURN_PATH,
  buildInviteBind,
  buildInviteRequest,
  buildJoinLink,
  buildPasswordBind,
  isWeChatUnavailable,
  readAuthorizeUrl,
  readInvite,
  readWeChatBindings,
  readWeChatCodeExchange,
  wechatAuthorizePlan,
  type InviteRole,
  type WeChatBindings,
  type WeChatChannel,
  type WeChatCodeExchange,
  type WeChatCodeExchangeUser,
  type WeChatIdentity,
} from '../domain/wechat';
import { apiDelete, apiGet, apiPost } from './http';
import { endpoints } from './endpoints';
import { readSession, type AuthSession } from './auth';

export interface WeChatLoginOption {
  enabled: boolean;
  url: string | null;
  channel: WeChatChannel;
}

const authorizePath: Record<WeChatChannel, string> = {
  mp: endpoints.wechatMpAuthorize,
  open: endpoints.wechatOpenAuthorize,
};

async function requestAuthorize(channel: WeChatChannel, scope: string | undefined, forCurrentUser: boolean) {
  const params: { returnTo: string; scope?: string } = { returnTo: WECHAT_RETURN_PATH };
  if (scope) params.scope = scope;
  return apiGet<{ url: string; scope: string }>(authorizePath[channel], params, {
    skipErrorToast: true,
    skipAuthRedirect: !forCurrentUser,
  });
}

export async function prepareWeChatLogin(userAgent = navigator.userAgent): Promise<WeChatLoginOption> {
  const plan = wechatAuthorizePlan(userAgent);
  try {
    const result = await requestAuthorize(plan.channel, plan.scope, false);
    const url = readAuthorizeUrl(result);
    return { enabled: Boolean(url), url, channel: plan.channel };
  } catch (error) {
    if (error instanceof ApiError && isWeChatUnavailable(error)) {
      return { enabled: false, url: null, channel: plan.channel };
    }
    return { enabled: false, url: null, channel: plan.channel };
  }
}

export function rememberInviteToken(token: string) {
  sessionStorage.setItem(WECHAT_INVITE_KEY, token);
}

export function readInviteToken(): string {
  return sessionStorage.getItem(WECHAT_INVITE_KEY) || '';
}

export function clearInviteToken() {
  sessionStorage.removeItem(WECHAT_INVITE_KEY);
}

export function rememberWeChatReturn(path: string) {
  sessionStorage.setItem(WECHAT_RETURN_KEY, path);
}

export function consumeWeChatReturn(): string {
  const path = sessionStorage.getItem(WECHAT_RETURN_KEY) || '/dashboard';
  sessionStorage.removeItem(WECHAT_RETURN_KEY);
  return path;
}

export function redirectToWeChat(url: string) {
  window.location.assign(url);
}

/** 已登录时带 Bearer。回调把微信绑到当前用户，并 302 回 returnTo。 */
export async function startWeChatBind(channel: WeChatChannel) {
  const scope = channel === 'mp' ? 'snsapi_userinfo' : undefined;
  const result = await requestAuthorize(channel, scope, true);
  const url = readAuthorizeUrl(result);
  if (!url) throw new ApiError('微信登录未配置', result.code === 0 ? -1 : result.code);
  rememberWeChatReturn('/personal-settings');
  redirectToWeChat(url);
}

/** 用微信回调带回的一次性 code 换会话：已绑定返回 JWT，未绑定返回 bindTicket。 */
export async function exchangeWeChatCode(code: string): Promise<WeChatCodeExchange> {
  const result = await apiPost<{
    token?: string;
    user?: WeChatCodeExchangeUser;
    bindTicket?: string;
    bindRequired?: boolean;
  }>(endpoints.wechatCodeExchange, { code }, { skipErrorToast: true, skipAuthRedirect: true });
  return readWeChatCodeExchange(result);
}

export async function bindWeChatAccount(input: {
  bindTicket: string;
  account?: string;
  password?: string;
  inviteToken?: string;
}): Promise<AuthSession & { message: string }> {
  const body = input.inviteToken
    ? buildInviteBind(input.bindTicket, input.inviteToken)
    : buildPasswordBind(input.bindTicket, input.account || '', input.password || '');
  const result = await apiPost<{ token: string; user: AuthSession['user'] }>(endpoints.wechatBind, body, {
    skipErrorToast: true,
    skipAuthRedirect: true,
  });
  return { message: result.message, ...readSession(result) };
}

export const wechatSettingsApi = {
  get: async (): Promise<WeChatBindings> => {
    const result = await apiGet<{ identities: WeChatIdentity[] }>(endpoints.wechatSettings);
    return readWeChatBindings(result);
  },
  unbind: async (channel: WeChatChannel) => {
    const path = channel === 'mp' ? endpoints.wechatUnbindMp : endpoints.wechatUnbindOpen;
    const result = await apiDelete(path);
    return result.message;
  },
};

export async function createFactoryInvite(factoryId: string, role: InviteRole, expiresInHours: number, origin: string) {
  const result = await apiPost<{ inviteToken: string; role: InviteRole; expiresAt: string }>(
    endpoints.factoryInvites(factoryId),
    buildInviteRequest(role, expiresInHours),
  );
  const invite = readInvite(result);
  return { ...invite, url: buildJoinLink(origin, invite.inviteToken) };
}
