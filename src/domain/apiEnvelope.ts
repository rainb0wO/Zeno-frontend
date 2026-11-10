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

export interface ApiSuccess<T> {
  message: string;
  data: T;
}

/** 成功响应必须是 `{ code: 0, message, data }`。 */
export function unwrapEnvelope<T>(body: unknown): ApiSuccess<T> {
  if (!body || typeof body !== 'object' || !('code' in body)) {
    throw new ApiError('服务器响应格式不正确', -1);
  }
  const envelope = body as { code?: unknown; message?: unknown; data?: T };
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
  return {
    message: typeof envelope.message === 'string' && envelope.message ? envelope.message : '操作成功',
    data: envelope.data as T,
  };
}

export function readNamedList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const value = (data as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

export function readErrorMessage(error: unknown, fallback = '请求失败'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
