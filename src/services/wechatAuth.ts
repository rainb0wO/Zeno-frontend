export interface WeChatLoginOption {
  /** 后端明确报告已配置后才为 true。未约定探测接口前保持关闭。 */
  enabled: boolean;
}

/**
 * 微信登录（公众号网页授权 / 开放平台扫码）的合同还没落地。
 * 这里只保留登录页的挂载点，不请求任何尚未写入 docs/API.md 的地址。
 * 合同到达后，只改这个函数：向后端确认是否已配置，再决定是否显示按钮。
 */
export async function loadWeChatLoginOption(): Promise<WeChatLoginOption> {
  return { enabled: false };
}

/** 合同落地后在这里跳转公众号网页授权或开放平台扫码。当前没有可调用的地址。 */
export function startWeChatLogin(): void {
  return;
}
