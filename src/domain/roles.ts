export type UserRole = 'ADMIN' | 'MANAGER' | 'HR' | 'USER' | 'SUPER_ADMIN';

const KNOWN_ROLES: readonly UserRole[] = ['ADMIN', 'MANAGER', 'HR', 'USER', 'SUPER_ADMIN'];

export function canonicalRole(role: string | null | undefined): string {
  return (role ?? '').trim().toUpperCase();
}

export function toUserRole(role: string | null | undefined): UserRole | null {
  const normalized = canonicalRole(role);
  return (KNOWN_ROLES as readonly string[]).includes(normalized) ? (normalized as UserRole) : null;
}

export function isFactoryAdmin(role: string | null | undefined): boolean {
  return canonicalRole(role) === 'ADMIN';
}

/** 计划、工序、计件、工资、厂区维护。 */
export function canWriteCore(role: string | null | undefined): boolean {
  const normalized = canonicalRole(role);
  return normalized === 'ADMIN' || normalized === 'MANAGER';
}

/** 文档写明部门可由 HR 与 SUPER_ADMIN 维护。 */
export function canWriteDepartment(role: string | null | undefined): boolean {
  const normalized = canonicalRole(role);
  return normalized === 'ADMIN' || normalized === 'MANAGER' || normalized === 'HR' || normalized === 'SUPER_ADMIN';
}

/** HR 可以新建和修改员工，不能删除。 */
export function canWriteEmployee(role: string | null | undefined): boolean {
  return canWriteCore(role) || canonicalRole(role) === 'HR';
}

export function canDeleteEmployee(role: string | null | undefined): boolean {
  return isFactoryAdmin(role);
}
