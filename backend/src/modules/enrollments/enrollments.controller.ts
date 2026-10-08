import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}
  @Post() create(@Body() dto: CreateEnrollmentDto, @CurrentUser() account: AuthUser) { return this.enrollments.create(dto, account); }
  @Get() @RequirePermissions('enrollments:read') list(@Query() query: EnrollmentQueryDto, @CurrentUser() account: AuthUser) { return this.enrollments.list(query, account); }
  @Get('me') me(@Query() query: EnrollmentQueryDto, @CurrentUser() account: AuthUser) { return this.enrollments.list(query, account, true); }
  @Get(':code') find(@Param('code') code: string, @CurrentUser() account: AuthUser) { return this.enrollments.find(code, account); }
  @Patch(':code') update(@Param('code') code: string, @Body() dto: UpdateEnrollmentDto, @CurrentUser() account: AuthUser) { return this.enrollments.change(code, dto.status, account); }
  @Delete(':code') @RequirePermissions('enrollments:delete') @HttpCode(204)
  async remove(@Param('code') code: string, @CurrentUser() account: AuthUser) { await this.enrollments.change(code, 'DELETE', account); }
}

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CourseEnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}
  @Get(':code/enrollments') @RequirePermissions('enrollments:read') list(@Param('code') code: string, @Query() query: EnrollmentQueryDto, @CurrentUser() account: AuthUser) {
    return this.enrollments.list(query, account, false, code);
  }
}
