import { canDeleteEmployee, canWriteCore, canWriteDepartment, canWriteEmployee, isFactoryAdmin } from '../domain/roles';
import { useUserStore } from '../stores/userStore';

export function useAccess() {
  const role = useUserStore((state) => state.role);
  return {
    role,
    isFactoryAdmin: isFactoryAdmin(role),
    canWriteCore: canWriteCore(role),
    canWriteDepartment: canWriteDepartment(role),
    canWriteEmployee: canWriteEmployee(role),
    canDeleteEmployee: canDeleteEmployee(role),
  };
}
