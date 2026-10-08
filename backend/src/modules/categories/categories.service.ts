import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { Course } from '../../database/entities/course.entity';
import { createCode } from '../../common/utils/code';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DataSource) {}
  async list() {
    const items = await this.db.getRepository(Category).find({ where: { isActive: true }, order: { name: 'ASC' } });
    return { items: items.map(({ code, name }) => ({ code, name })) };
  }

  async create(rawName: string) {
    const name = rawName.trim();
    const repository = this.db.getRepository(Category);
    const existing = await repository.createQueryBuilder('category')
      .where('LOWER(category.name) = LOWER(:name)', { name })
      .getOne();
    if (existing) throw new ConflictException('Danh mục đã tồn tại.');
    const category = await repository.save(repository.create({ code: createCode('CAT'), name, isActive: true }));
    return { code: category.code, name: category.name };
  }

  async remove(code: string) {
    const repository = this.db.getRepository(Category);
    const category = await repository.findOneBy({ code });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục.');
    const courseCount = await this.db.getRepository(Course).countBy({ categoryCode: code });
    if (courseCount > 0) throw new ConflictException(`Không thể xóa danh mục đang được ${courseCount} khóa học sử dụng.`);
    await repository.remove(category);
  }
}
