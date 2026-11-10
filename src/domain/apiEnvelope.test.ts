import { describe, expect, it } from 'vitest';
import { ApiError, readNamedList, unwrapEnvelope } from './apiEnvelope';

describe('unwrapEnvelope', () => {
  it('returns data when code is 0', () => {
    expect(unwrapEnvelope({ code: 0, message: 'ok', data: { id: '1' } })).toEqual({
      message: 'ok',
      data: { id: '1' },
    });
  });

  it('rejects a non-zero business code', () => {
    expect(() => unwrapEnvelope({ code: 1004, message: '密码错误' })).toThrow(ApiError);
    try {
      unwrapEnvelope({ code: 1004, message: '密码错误' });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('密码错误');
      expect((error as ApiError).code).toBe(1004);
    }
  });

  it('rejects a payload that is not the contract', () => {
    expect(() => unwrapEnvelope({ token: 'x' })).toThrow('服务器响应格式不正确');
  });
});

describe('readNamedList', () => {
  it('reads pieceWorks and also accepts a bare array', () => {
    expect(readNamedList({ pieceWorks: [{ id: 'a' }] }, 'pieceWorks')).toEqual([{ id: 'a' }]);
    expect(readNamedList([{ id: 'b' }], 'pieceWorks')).toEqual([{ id: 'b' }]);
    expect(readNamedList({}, 'pieceWorks')).toEqual([]);
  });
});
