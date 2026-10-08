import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}
  @Get() @RequirePermissions('users:read') list(@Query() query: UserQueryDto) { return this.users.list(query); }
  @Get(':id') @RequirePermissions('users:read') find(@Param('id', ParseUUIDPipe) id: string) { return this.users.find(id); }
  @Post() @RequirePermissions('users:write') create(@Body() dto: CreateUserDto) { return this.users.create(dto); }
  @Patch(':id') @RequirePermissions('users:write') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminUserDto, @CurrentUser() account: AuthUser) {
    return this.users.update(id, dto, account.user.id);
  }
  @Delete(':id') @RequirePermissions('users:delete') @HttpCode(204) remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() account: AuthUser) {
    return this.users.remove(id, account.user.id);
  }
}
