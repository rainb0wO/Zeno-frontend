import { describe, expect, it } from 'vitest';
import { buildGroupEntryLink, buildGroupSavePayload, normalizeGroupInit, readRotatedToken } from './groupEntry';

describe('group entry', () => {
  it('saves with the employee primary key and a calendar date', () => {
    expect(buildGroupSavePayload({
      token: 'abc',
      date: '2026-11-10',
      records: [{ employeeId: 'emp_pk', quantity: 12 }],
    })).toEqual({
      token: 'abc',
      date: '2026-11-10',
      records: [{ employeeId: 'emp_pk', quantity: 12 }],
    });
    expect(() => buildGroupSavePayload({ token: 'abc', date: '11/10/2026', records: [] })).toThrow('YYYY-MM-DD');
  });

  it('builds a share link and reads a rotated token', () => {
    expect(buildGroupEntryLink('https://zeno.asia', 'new-token')).toBe(
      'https://zeno.asia/h5/group-capacity-entry?token=new-token',
    );
    expect(readRotatedToken({ groupEntryToken: 'rotated' }).token).toBe('rotated');
  });

  it('normalizes grouped init data', () => {
    const view = normalizeGroupInit({
      factory: { name: '一厂' },
      groups: [{ id: 'g1', name: '缝制组', employees: [{ id: 'e1', name: '张三', quantity: 8 }] }],
    });
    expect(view.factoryName).toBe('一厂');
    expect(view.groups[0].employees[0].id).toBe('e1');
  });
});
