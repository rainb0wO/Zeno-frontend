export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'SUPER_ADMIN';

const KNOWN_ROLES: readonly UserRole[] = ['ADMIN', 'MANAGER', 'USER', 'SUPER_ADMIN'];

export function canonicalRole(role: string | null | undefined): string {
  return (role ?? '').trim().toUpperCase();
}

export function toUserRole(role: string | null | undefined): UserRole | null {
  const normalized = canonicalRole(role);
  return (KNOWN_ROLES as readonly string[]).includes(normalized) ? (normalized as UserRole) : null;
}

/** 超管模块已延期，但若账号仍是 SUPER_ADMIN，按厂区管理员使用核心功能。 */
export function isAdmin(role: string | null | undefined): boolean {
  const normalized = canonicalRole(role);
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}

export function canEdit(role: string | null | undefined): boolean {
  const normalized = canonicalRole(role);
  return normalized === 'ADMIN' || normalized === 'MANAGER' || normalized === 'SUPER_ADMIN';
}
