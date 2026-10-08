import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CoursesService } from './courses.service';
import { CourseQueryDto } from './dto/course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}
  @Get() list(@Query() query: CourseQueryDto) { return this.courses.list(query); }
  @Get(':code') find(@Param('code') code: string) { return this.courses.find(code); }
}

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminCoursesController {
  constructor(private readonly courses: CoursesService) {}
  @Get() @RequirePermissions('courses:read') list(@Query() query: CourseQueryDto) { return this.courses.list(query, true); }
  @Get(':code') @RequirePermissions('courses:read') find(@Param('code') code: string) { return this.courses.find(code, true); }
  @Post() @RequirePermissions('courses:write') create(@Body() dto: CreateCourseDto) { return this.courses.create(dto); }
  @Patch(':code') @RequirePermissions('courses:write') update(@Param('code') code: string, @Body() dto: UpdateCourseDto) { return this.courses.update(code, dto); }
  @Delete(':code') @RequirePermissions('courses:delete') @HttpCode(204) remove(@Param('code') code: string) { return this.courses.remove(code); }
}
