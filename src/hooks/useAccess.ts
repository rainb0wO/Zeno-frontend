import { canEdit, isAdmin } from '../domain/roles';
import { useUserStore } from '../stores/userStore';

export function useAccess() {
  const role = useUserStore((state) => state.role);
  return {
    role,
    isAdmin: isAdmin(role),
    canEdit: canEdit(role),
  };
}
