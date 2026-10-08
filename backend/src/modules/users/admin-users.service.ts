import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities/user.entity';
import { AuthSession } from '../../database/entities/auth-session.entity';
import { Enrollment } from '../../database/entities/enrollment.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { rethrowDatabaseError } from '../../common/utils/database-error';

@Injectable()
export class AdminUsersService {
  constructor(private readonly db: DataSource, private readonly users: UsersService) {}
  async list(query: UserQueryDto) {
    const qb = this.db.getRepository(User).createQueryBuilder('user');
    if (query.search) qb.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', { search: `%${query.search}%` });
    if (query.role) qb.andWhere('user.role = :role', { role: query.role });
    if (query.isActive !== undefined) qb.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    const [items, total] = await qb.orderBy('user.createdAt', 'DESC').addOrderBy('user.id', 'ASC').skip((query.page - 1) * query.limit).take(query.limit).getManyAndCount();
    return { items: items.map(user => this.users.publicUser(user)), total, page: query.page, limit: query.limit };
  }
  async find(id: string) {
    const user = await this.db.getRepository(User).findOneBy({ id });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng.');
    return this.users.publicUser(user);
  }
  private async hash(password: string) {
    if (Buffer.byteLength(password, 'utf8') > 72) throw new BadRequestException('Mật khẩu tối đa 72 byte UTF-8.');
    return bcrypt.hash(password, 10);
  }
  async create(dto: CreateUserDto) {
    const passwordHash = await this.hash(dto.password);
    try {
      const repository = this.db.getRepository(User);
      const user = await repository.save(repository.create({ id: randomUUID(), fullName: dto.fullName, email: dto.email, passwordHash, role: dto.role || 'STUDENT', isActive: dto.isActive ?? true }));
      return this.users.publicUser(user);
    } catch (error) { rethrowDatabaseError(error); }
  }
  async update(id: string, dto: UpdateAdminUserDto, actorId: string) {
    const passwordHash = dto.password !== undefined ? await this.hash(dto.password) : undefined;
    try {
      return await this.db.transaction(async manager => {
        const user = await manager.getRepository(User).createQueryBuilder('user').addSelect('user.googleId').where('user.id = :id', { id }).setLock('pessimistic_write').getOne();
        if (!user) throw new NotFoundException('Không tìm thấy người dùng.');
        if (actorId === id && dto.role !== undefined && dto.role !== user.role) throw new ConflictException('Không được tự đổi vai trò của mình.');
        if (actorId === id && dto.isActive === false) throw new ConflictException('Không được tự khóa tài khoản đang đăng nhập.');
        if (dto.role !== undefined && dto.role !== user.role && await manager.existsBy(Enrollment, { studentId: id })) {
          throw new ConflictException('Không đổi vai trò người dùng đã có lịch sử ghi danh.');
        }
        if (dto.email !== undefined && dto.email !== user.email && user.googleId) throw new ConflictException('Không đổi email của tài khoản đã liên kết Google.');
        const revoke = passwordHash !== undefined || (dto.role !== undefined && dto.role !== user.role) || (dto.email !== undefined && dto.email !== user.email) || dto.isActive === false;
        if (dto.fullName !== undefined) user.fullName = dto.fullName;
        if (dto.email !== undefined) user.email = dto.email;
        if (dto.role !== undefined) user.role = dto.role;
        if (dto.isActive !== undefined) user.isActive = dto.isActive;
        if (passwordHash !== undefined) user.passwordHash = passwordHash;
        const saved = await manager.save(user);
        if (revoke) await manager.delete(AuthSession, { userId: id });
        return this.users.publicUser(saved);
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
  async remove(id: string, actorId: string) {
    if (id === actorId) throw new ConflictException('Không được tự xóa tài khoản đang đăng nhập.');
    try {
      await this.db.transaction(async manager => {
        const user = await manager.findOne(User, { where: { id }, lock: { mode: 'pessimistic_write' } });
        if (!user) throw new NotFoundException('Không tìm thấy người dùng.');
        if (await manager.existsBy(Enrollment, { studentId: id })) throw new ConflictException('Người dùng có lịch sử ghi danh, không thể xóa.');
        await manager.remove(user);
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
}
