import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Category } from '../../database/entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DataSource) {}
  async list() {
    const items = await this.db.getRepository(Category).find({ where: { isActive: true }, order: { name: 'ASC' } });
    return { items: items.map(({ code, name }) => ({ code, name })) };
  }
}
