import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AdminUsersService } from './admin-users.service';
import { BulkDeleteUsersDto } from './dto/bulk-delete-users.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}
  @Get() @RequirePermissions('users:read') list(@Query() query: UserQueryDto) { return this.users.list(query); }
  @Get(':code') @RequirePermissions('users:read') find(@Param('code') code: string) { return this.users.find(code); }
  @Post() @RequirePermissions('users:write') create(@Body() dto: CreateUserDto) { return this.users.create(dto); }
  @Patch(':code') @RequirePermissions('users:write') update(@Param('code') code: string, @Body() dto: UpdateAdminUserDto, @CurrentUser() account: AuthUser) {
    return this.users.update(code, dto, account.user.id);
  }
  @Post(':code/reset-password') @RequirePermissions('users:write') resetPassword(@Param('code') code: string, @CurrentUser() account: AuthUser) {
    return this.users.resetPassword(code, account.user.id);
  }
  @Delete() @RequirePermissions('users:delete') @HttpCode(204) removeMany(@Body() dto: BulkDeleteUsersDto, @CurrentUser() account: AuthUser) {
    return this.users.removeMany(dto.codes, account.user.id);
  }
  @Delete(':code') @RequirePermissions('users:delete') @HttpCode(204) remove(@Param('code') code: string, @CurrentUser() account: AuthUser) {
    return this.users.remove(code, account.user.id);
  }
}
