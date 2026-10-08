import type { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';
import type { Permission } from '../types';

export default function PermissionGate({ permission, children }: { permission: Permission; children: ReactNode }) {
  return usePermission(permission) ? children : null;
}

