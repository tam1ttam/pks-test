import type { UserRole } from '../../database/entities/user.entity';

export type Permission =
  | 'users:read' | 'users:write' | 'users:delete'
  | 'courses:read' | 'courses:write' | 'courses:delete'
  | 'enrollments:read' | 'enrollments:write' | 'enrollments:delete';

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  STUDENT: [],
  ADMIN: ['users:read', 'users:write', 'users:delete', 'courses:read', 'courses:write', 'courses:delete', 'enrollments:read', 'enrollments:write', 'enrollments:delete'],
};

