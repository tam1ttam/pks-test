import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from '../interfaces/auth-user.interface';
import type { UserRole } from '../../database/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [context.getHandler(), context.getClass()]);
    const account = context.switchToHttp().getRequest().user as AuthUser | undefined;
    return !roles || (!!account && roles.includes(account.user.role));
  }
}
