import { describe, expect, it } from 'vitest';
import { buildGroupEntryLink, buildGroupSavePayload, normalizeGroupInit } from './groupEntry';

describe('group entry', () => {
  it('saves one group with the employee primary key', () => {
    expect(buildGroupSavePayload({
      token: 'abc',
      date: '2026-11-10',
      groupId: 'g1',
      records: [{ employeeId: 'emp_pk', quantity: 12, remark: '白班' }],
    })).toEqual({
      token: 'abc',
      date: '2026-11-10',
      groupId: 'g1',
      records: [{ employeeId: 'emp_pk', quantity: 12, remark: '白班' }],
    });
    expect(() => buildGroupSavePayload({ token: 'abc', date: '11/10/2026', groupId: 'g1', records: [] })).toThrow('YYYY-MM-DD');
  });

  it('reads the documented init shape and shows the staff number separately', () => {
    const view = normalizeGroupInit({
      factory: { name: '一厂' },
      date: '2026-11-10',
      editable: true,
      groups: [{ id: 'g1', name: '缝制一组', employees: [{ id: 'pk1', employeeId: 'EMP001', name: '张师傅' }] }],
      records: [{ employeeId: 'pk1', groupId: 'g1', quantity: 10, remark: '白班' }],
    });
    expect(view.factoryName).toBe('一厂');
    expect(view.groups[0].employees[0]).toMatchObject({ id: 'pk1', staffNo: 'EMP001', quantity: 10, remark: '白班' });
    expect(buildGroupEntryLink('https://zeno.asia', 'tok')).toBe('https://zeno.asia/h5/group-capacity-entry?token=tok');
  });
});
