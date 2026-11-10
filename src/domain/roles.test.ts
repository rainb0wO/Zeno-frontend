import { describe, expect, it } from 'vitest';
import { canDeleteEmployee, canWriteCore, canWriteDepartment, canWriteEmployee, isFactoryAdmin, toUserRole } from './roles';

describe('roles', () => {
  it('follows the documented write rules', () => {
    expect(toUserRole('hr')).toBe('HR');
    expect(isFactoryAdmin('ADMIN')).toBe(true);
    expect(isFactoryAdmin('MANAGER')).toBe(false);
    expect(canWriteCore('MANAGER')).toBe(true);
    expect(canWriteCore('HR')).toBe(false);
    expect(canWriteEmployee('MANAGER')).toBe(true);
    expect(canWriteEmployee('HR')).toBe(true);
    expect(canDeleteEmployee('HR')).toBe(false);
    expect(canDeleteEmployee('MANAGER')).toBe(false);
    expect(canDeleteEmployee('ADMIN')).toBe(true);
    expect(canWriteDepartment('HR')).toBe(true);
    expect(canWriteDepartment('SUPER_ADMIN')).toBe(true);
    expect(canWriteDepartment('USER')).toBe(false);
  });
});
