import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
  @Get(':id') find(@Param('id', ParseUUIDPipe) id: string) { return this.courses.find(id); }
}

@Controller('admin/courses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminCoursesController {
  constructor(private readonly courses: CoursesService) {}
  @Get() @RequirePermissions('courses:read') list(@Query() query: CourseQueryDto) { return this.courses.list(query, true); }
  @Get(':id') @RequirePermissions('courses:read') find(@Param('id', ParseUUIDPipe) id: string) { return this.courses.find(id, true); }
  @Post() @RequirePermissions('courses:write') create(@Body() dto: CreateCourseDto) { return this.courses.create(dto); }
  @Patch(':id') @RequirePermissions('courses:write') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCourseDto) { return this.courses.update(id, dto); }
  @Delete(':id') @RequirePermissions('courses:delete') @HttpCode(204) remove(@Param('id', ParseUUIDPipe) id: string) { return this.courses.remove(id); }
}
