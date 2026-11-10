import { describe, expect, it } from 'vitest';
import { canEdit, isAdmin, toUserRole } from './roles';

describe('roles', () => {
  it('normalizes backend uppercase roles', () => {
    expect(toUserRole('admin')).toBe('ADMIN');
    expect(toUserRole(' SUPER_ADMIN ')).toBe('SUPER_ADMIN');
    expect(isAdmin('ADMIN')).toBe(true);
    expect(canEdit('MANAGER')).toBe(true);
    expect(canEdit('USER')).toBe(false);
    expect(isAdmin('USER')).toBe(false);
  });
});
