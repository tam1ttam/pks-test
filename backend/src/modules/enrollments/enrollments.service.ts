import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Enrollment, EnrollmentStatus } from '../../database/entities/enrollment.entity';
import { User } from '../../database/entities/user.entity';
import { Course } from '../../database/entities/course.entity';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { rethrowDatabaseError } from '../../common/utils/database-error';
import { vietnamDate } from '../../common/utils/date';
import { createCode } from '../../common/utils/code';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly db: DataSource) {}
  private present(enrollment: Enrollment) {
    return {
      code: enrollment.code, studentCode: enrollment.student.code, courseCode: enrollment.course.code,
      status: enrollment.status, enrolledAt: enrollment.enrolledAt,
      enrolledDate: vietnamDate(enrollment.enrolledAt), updatedAt: enrollment.updatedAt,
      student: { code: enrollment.student.code, fullName: enrollment.student.fullName, email: enrollment.student.email },
      course: { code: enrollment.course.code, name: enrollment.course.name, categoryCode: enrollment.course.categoryCode, category: enrollment.course.category, instructor: enrollment.course.instructor, shortDescription: enrollment.course.shortDescription, description: enrollment.course.description, tuition: enrollment.course.tuition, capacity: enrollment.course.capacity, enrolledCount: enrollment.course.enrolledCount, isPublished: enrollment.course.isPublished, imageUrl: enrollment.course.imageUrl, availability: enrollment.course.enrolledCount < enrollment.course.capacity ? 'AVAILABLE' : 'FULL' },
    };
  }
  private checkOwner(enrollment: Enrollment, account: AuthUser) {
    if (account.user.role === 'STUDENT' && enrollment.studentId !== account.user.id) throw new NotFoundException('Không tìm thấy ghi danh.');
  }
  private async read(manager: EntityManager, code: string) {
    const enrollment = await manager.findOne(Enrollment, { where: { code }, relations: { student: true, course: true } });
    if (!enrollment) throw new NotFoundException('Không tìm thấy ghi danh.');
    return enrollment;
  }
  async find(code: string, account: AuthUser) {
    const enrollment = await this.read(this.db.manager, code);
    this.checkOwner(enrollment, account);
    return this.present(enrollment);
  }
  async list(query: EnrollmentQueryDto, account: AuthUser, own = false, courseCode?: string) {
    const ownerId = own || account.user.role === 'STUDENT' ? account.user.id : undefined;
    const qb = this.db.getRepository(Enrollment).createQueryBuilder('enrollment').innerJoinAndSelect('enrollment.student', 'student').innerJoinAndSelect('enrollment.course', 'course');
    if (ownerId) qb.andWhere('enrollment.studentId = :studentId', { studentId: ownerId });
    else if (query.studentCode) qb.andWhere('student.code = :studentCode', { studentCode: query.studentCode });
    if (courseCode || query.courseCode) qb.andWhere('course.code = :courseCode', { courseCode: courseCode || query.courseCode });
    if (query.status) qb.andWhere('enrollment.status = :status', { status: query.status });
    if (query.search) qb.andWhere('(course.name ILIKE :search OR student.fullName ILIKE :search OR student.email ILIKE :search)', { search: `%${query.search}%` });
    if (courseCode && !await this.db.getRepository(Course).existsBy({ code: courseCode })) throw new NotFoundException('Không tìm thấy khóa học.');
    const [items, total] = await qb.orderBy('enrollment.enrolledAt', 'DESC').addOrderBy('enrollment.id', 'ASC').skip((query.page - 1) * query.limit).take(query.limit).getManyAndCount();
    return { items: items.map(item => this.present(item)), total, page: query.page, limit: query.limit };
  }
  // Every enrollment mutation locks User -> Course -> Enrollment in this order.
  private async lockCourse(manager: EntityManager, studentId: string | undefined, studentCode: string | undefined, courseCode: string) {
    const student = await manager.findOne(User, { where: studentId ? { id: studentId } : { code: studentCode! }, lock: { mode: 'pessimistic_write' } });
    if (!student) throw new NotFoundException('Không tìm thấy học viên.');
    if (student.role !== 'STUDENT') throw new BadRequestException('Chỉ tài khoản Student được ghi danh.');
    const course = await manager.findOne(Course, { where: { code: courseCode }, lock: { mode: 'pessimistic_write' } });
    if (!course) throw new NotFoundException('Không tìm thấy khóa học.');
    return { student, course };
  }
  private requireSeat(course: Course) {
    if (!course.isPublished) throw new ConflictException('Khóa học đang ẩn, không nhận ghi danh.');
    if (course.enrolledCount >= course.capacity) throw new ConflictException('Khóa học đã hết chỗ.');
  }
  async create(dto: CreateEnrollmentDto, account: AuthUser) {
    const studentId = account.user.role === 'STUDENT' ? account.user.id : undefined;
    if (account.user.role === 'STUDENT' && dto.studentCode !== undefined && dto.studentCode !== account.user.code) throw new ForbiddenException('Không được ghi danh thay học viên khác.');
    if (!studentId && !dto.studentCode) throw new BadRequestException('Admin phải chọn studentCode.');
    try {
      return await this.db.transaction(async manager => {
        const { student, course } = await this.lockCourse(manager, studentId, dto.studentCode, dto.courseCode);
        if (await manager.existsBy(Enrollment, { studentId: student.id, courseId: course.id })) throw new ConflictException('Học viên đã có ghi danh cho khóa học này. Dùng PATCH để kích hoạt lại nếu đã hủy.');
        this.requireSeat(course);
        const enrollment = await manager.save(Enrollment, { id: randomUUID(), code: createCode('ENR'), studentId: student.id, courseId: course.id, status: 'ENROLLED' });
        course.enrolledCount += 1;
        await manager.save(course);
        return this.present(await this.read(manager, enrollment.code));
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
  async requestCancellation(code: string, account: AuthUser) {
    if (account.user.role !== 'STUDENT') throw new ForbiddenException('Ch? h?c vi?n m?i g?i y?u c?u h?y ghi danh.');
    const enrollment = await this.read(this.db.manager, code);
    this.checkOwner(enrollment, account);
    if (enrollment.status !== 'ENROLLED') throw new ConflictException('Ghi danh n?y kh?ng th? g?i y?u c?u h?y.');
    enrollment.status = 'CANCEL_REQUESTED';
    await this.db.getRepository(Enrollment).save(enrollment);
    return this.present(await this.read(this.db.manager, code));
  }
  async reenroll(code: string, account: AuthUser) {
    if (account.user.role !== 'STUDENT') throw new ForbiddenException('Chỉ học viên mới có thể ghi danh lại.');
    return this.db.transaction(async manager => {
      const initial = await this.read(manager, code);
      this.checkOwner(initial, account);
      if (initial.status !== 'CANCELLED') throw new ConflictException('Chỉ có thể ghi danh lại sau khi yêu cầu hủy đã được duyệt.');
      const retryAt = initial.updatedAt.getTime() + 60_000;
      if (Date.now() < retryAt) throw new ConflictException({ message: 'Hãy thử ghi danh lại sau 1 phút.', retryAt: new Date(retryAt).toISOString() });
      const { course } = await this.lockCourse(manager, initial.studentId, undefined, initial.course.code);
      const enrollment = await manager.findOne(Enrollment, { where: { code }, lock: { mode: 'pessimistic_write' } });
      if (!enrollment || enrollment.status !== 'CANCELLED') throw new ConflictException('Ghi danh đã thay đổi trạng thái.');
      this.requireSeat(course);
      enrollment.status = 'ENROLLED'; course.enrolledCount += 1;
      await manager.save(enrollment); await manager.save(course);
      return this.present(await this.read(manager, code));
    });
  }
  async change(code: string, status: EnrollmentStatus | 'DELETE', account: AuthUser) {
    try {
      return await this.db.transaction(async manager => {
        const initial = await manager.findOneBy(Enrollment, { code });
        if (!initial) throw new NotFoundException('Không tìm thấy ghi danh.');
        this.checkOwner(initial, account);
        if (account.user.role === 'STUDENT') throw new ForbiddenException('Y?u c?u h?y ghi danh ph?i ???c Admin duy?t.');
        const { course } = await this.lockCourse(manager, initial.studentId, undefined, (await manager.findOneByOrFail(Course, { id: initial.courseId })).code);
        const enrollment = await manager.findOne(Enrollment, { where: { code }, lock: { mode: 'pessimistic_write' } });
        if (!enrollment) throw new NotFoundException('Không tìm thấy ghi danh.');
        if (status === 'DELETE') {
          if (enrollment.status !== 'CANCELLED') course.enrolledCount -= 1;
          await manager.remove(enrollment);
          await manager.save(course);
          return;
        }
        if (enrollment.status !== status) {
          if (status === 'ENROLLED' && enrollment.status === 'CANCELLED') { this.requireSeat(course); course.enrolledCount += 1; }
          if (status === 'CANCELLED' && enrollment.status !== 'CANCELLED') course.enrolledCount -= 1;
          enrollment.status = status;
          await manager.save(enrollment);
          await manager.save(course);
        }
        return this.present(await this.read(manager, code));
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
}
