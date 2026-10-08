import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  @Get() list() { return this.categories.list(); }
}

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Post()
  @RequirePermissions('courses:write')
  create(@Body() dto: CreateCategoryDto) { return this.categories.create(dto.name); }

  @Delete(':code')
  @RequirePermissions('courses:delete')
  @HttpCode(204)
  remove(@Param('code') code: string) { return this.categories.remove(code); }
}
