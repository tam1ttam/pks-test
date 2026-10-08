import type { Permission, Role } from '../types';

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  STUDENT: [],
  ADMIN: ['dashboard:view', 'users:read', 'users:write', 'users:delete', 'courses:read', 'courses:write', 'courses:delete', 'enrollments:read', 'enrollments:write', 'enrollments:delete'],
};

export function can(role: Role | undefined, permission: Permission) {
  return role ? ROLE_PERMISSIONS[role].includes(permission) : false;
}

