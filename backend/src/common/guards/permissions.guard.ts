import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLE_PERMISSIONS, type Permission } from '../interfaces/permission';
import type { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const account = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    if (account && required.every(permission => ROLE_PERMISSIONS[account.user.role].includes(permission))) return true;
    throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này.');
  }
}

