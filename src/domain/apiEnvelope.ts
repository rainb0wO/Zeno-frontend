export class ApiError extends Error {
  code: number;
  status?: number;

  constructor(message: string, code: number, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/** 成功体是 `{ code: 0, message, ...字段 }`，业务字段与 code 平级。 */
export type ApiEnvelope<T extends object = Record<string, never>> = {
  code: 0;
  message: string;
} & T;

export function unwrapEnvelope<T extends object>(body: unknown): ApiEnvelope<T> {
  if (!body || typeof body !== 'object' || !('code' in body)) {
    throw new ApiError('服务器响应格式不正确', -1);
  }
  const envelope = body as { code?: unknown; message?: unknown };
  const code = Number(envelope.code);
  if (!Number.isFinite(code)) {
    throw new ApiError('服务器响应格式不正确', -1);
  }
  if (code !== 0) {
    const message = typeof envelope.message === 'string' && envelope.message
      ? envelope.message
      : '请求失败';
    throw new ApiError(message, code);
  }
  return body as ApiEnvelope<T>;
}

export function requireList<T>(body: object, key: string): T[] {
  const value = (body as Record<string, unknown>)[key];
  if (!Array.isArray(value)) {
    throw new ApiError(`响应缺少 ${key}`, -1);
  }
  return value as T[];
}

export function readErrorMessage(error: unknown, fallback = '请求失败'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
