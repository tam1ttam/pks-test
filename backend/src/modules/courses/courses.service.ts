import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Course } from '../../database/entities/course.entity';
import { Enrollment } from '../../database/entities/enrollment.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { rethrowDatabaseError } from '../../common/utils/database-error';

@Injectable()
export class CoursesService {
  constructor(private readonly db: DataSource) {}
  present(course: Course) {
    return { ...course, availability: course.enrolledCount < course.capacity ? 'AVAILABLE' : 'FULL' };
  }
  async list(query: CourseQueryDto, admin = false) {
    const qb = this.db.getRepository(Course).createQueryBuilder('course');
    if (!admin) qb.andWhere('course.isPublished = true');
    else if (query.isPublished !== undefined) qb.andWhere('course.isPublished = :published', { published: query.isPublished });
    if (query.search) qb.andWhere('course.name ILIKE :search', { search: `%${query.search}%` });
    if (query.category) qb.andWhere('LOWER(course.category) = LOWER(:category)', { category: query.category });
    const [items, total] = await qb.orderBy('course.createdAt', 'DESC').addOrderBy('course.id', 'ASC').skip((query.page - 1) * query.limit).take(query.limit).getManyAndCount();
    return { items: items.map(item => this.present(item)), total, page: query.page, limit: query.limit };
  }
  async find(id: string, admin = false) {
    const course = await this.db.getRepository(Course).findOneBy(admin ? { id } : { id, isPublished: true });
    if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
    return this.present(course);
  }
  async create(dto: CreateCourseDto) {
    const repository = this.db.getRepository(Course);
    return this.present(await repository.save(repository.create({ ...dto, id: randomUUID(), enrolledCount: 0 })));
  }
  async update(id: string, dto: UpdateCourseDto) {
    try {
      return await this.db.transaction(async manager => {
        const course = await manager.findOne(Course, { where: { id }, lock: { mode: 'pessimistic_write' } });
        if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
        if (dto.capacity !== undefined && dto.capacity < course.enrolledCount) throw new ConflictException('Sĩ số tối đa không được thấp hơn số học viên đang ghi danh.');
        Object.assign(course, dto);
        return this.present(await manager.save(course));
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
  async remove(id: string) {
    try {
      await this.db.transaction(async manager => {
        const course = await manager.findOne(Course, { where: { id }, lock: { mode: 'pessimistic_write' } });
        if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
        if (await manager.existsBy(Enrollment, { courseId: id })) throw new ConflictException('Khóa học đã có lịch sử ghi danh. Hãy ẩn khóa học thay vì xóa.');
        await manager.remove(course);
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
}
