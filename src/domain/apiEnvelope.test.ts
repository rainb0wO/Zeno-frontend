import { describe, expect, it } from 'vitest';
import { ApiError, requireList, unwrapEnvelope } from './apiEnvelope';

describe('unwrapEnvelope', () => {
  it('keeps business fields beside code and message', () => {
    expect(unwrapEnvelope({ code: 0, message: '注册成功', token: 'jwt', user: { id: '1' } })).toEqual({
      code: 0,
      message: '注册成功',
      token: 'jwt',
      user: { id: '1' },
    });
  });

  it('rejects a non-zero business code', () => {
    expect(() => unwrapEnvelope({ code: 1004, message: '密码错误' })).toThrow(ApiError);
  });

  it('rejects a payload that is not the contract', () => {
    expect(() => unwrapEnvelope({ token: 'x' })).toThrow('服务器响应格式不正确');
  });
});

describe('requireList', () => {
  it('reads only the documented key', () => {
    expect(requireList({ pieceWorks: [{ id: 'a' }] }, 'pieceWorks')).toEqual([{ id: 'a' }]);
    expect(() => requireList({}, 'pieceWorks')).toThrow('响应缺少 pieceWorks');
    expect(() => requireList([], 'pieceWorks')).toThrow('响应缺少 pieceWorks');
  });
});
