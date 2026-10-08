import { can } from '../constants/permissions';
import { useAuth } from '../store/auth.store';
import type { Permission } from '../types';

export function usePermission(permission: Permission) {
  return can(useAuth(state => state.user?.role), permission);
}

