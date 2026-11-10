import { ApiError } from '../domain/apiEnvelope';
import {
  WECHAT_INVITE_KEY,
  WECHAT_RETURN_KEY,
  buildInviteBind,
  buildPasswordBind,
  isWeChatNotConfigured,
  readAuthorizeOutcome,
  readInviteLink,
  readWeChatBindings,
  wechatAuthorizePlan,
  type WeChatBindings,
  type WeChatChannel,
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

async function requestAuthorize(channel: WeChatChannel, scope: string, forCurrentUser: boolean) {
  return apiGet<unknown>(authorizePath[channel], { scope }, {
    skipErrorToast: true,
    skipAuthRedirect: !forCurrentUser,
  });
}

export async function prepareWeChatLogin(userAgent = navigator.userAgent): Promise<WeChatLoginOption> {
  const plan = wechatAuthorizePlan(userAgent);
  try {
    const result = await requestAuthorize(plan.channel, plan.scope, false);
    const outcome = readAuthorizeOutcome(result.data, result.message);
    return { enabled: outcome.configured && Boolean(outcome.url), url: outcome.url, channel: plan.channel };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (isWeChatNotConfigured(message) || error instanceof ApiError) {
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

/** 已登录时带 Bearer 调用 authorize，授权完成后由后端绑定到当前用户。 */
export async function startWeChatBind(channel: WeChatChannel) {
  const scope = channel === 'mp' ? 'snsapi_userinfo' : 'snsapi_login';
  const result = await requestAuthorize(channel, scope, true);
  const outcome = readAuthorizeOutcome(result.data, result.message);
  if (!outcome.configured || !outcome.url) {
    throw new ApiError(result.message || '微信登录未配置', -1);
  }
  rememberWeChatReturn('/personal-settings');
  redirectToWeChat(outcome.url);
}

export async function bindWeChatAccount(input: {
  bindTicket: string;
  username?: string;
  password?: string;
  inviteToken?: string;
}): Promise<AuthSession & { message: string }> {
  const body = input.inviteToken
    ? buildInviteBind(input.bindTicket, input.inviteToken)
    : buildPasswordBind(input.bindTicket, input.username || '', input.password || '');
  const result = await apiPost<unknown>(endpoints.wechatBind, body, { skipErrorToast: true, skipAuthRedirect: true });
  return { message: result.message, ...readSession(result.data) };
}

export const wechatSettingsApi = {
  get: async (): Promise<WeChatBindings> => {
    const result = await apiGet<unknown>(endpoints.wechatSettings);
    return readWeChatBindings(result.data);
  },
  unbind: async (channel: WeChatChannel) => {
    const path = channel === 'mp' ? endpoints.wechatUnbindMp : endpoints.wechatUnbindOpen;
    const result = await apiDelete<unknown>(path);
    return result.message;
  },
};

export async function createFactoryInvite(factoryId: string, origin: string) {
  const result = await apiPost<unknown>(endpoints.factoryInvites(factoryId), {});
  return { message: result.message, ...readInviteLink(result.data, origin) };
}
