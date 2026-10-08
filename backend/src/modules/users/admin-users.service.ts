import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomBytes, randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities/user.entity';
import { AuthSession } from '../../database/entities/auth-session.entity';
import { Enrollment } from '../../database/entities/enrollment.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { rethrowDatabaseError } from '../../common/utils/database-error';
import { createCode } from '../../common/utils/code';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly db: DataSource, private readonly users: UsersService, private readonly mail: MailService) {}
  async list(query: UserQueryDto) {
    const qb = this.db.getRepository(User).createQueryBuilder('user');
    if (query.search) qb.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', { search: `%${query.search}%` });
    if (query.role) qb.andWhere('user.role = :role', { role: query.role });
    if (query.isActive !== undefined) qb.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    const [items, total] = await qb.orderBy('user.createdAt', 'DESC').addOrderBy('user.id', 'ASC').skip((query.page - 1) * query.limit).take(query.limit).getManyAndCount();
    return { items: items.map(user => this.users.publicUser(user)), total, page: query.page, limit: query.limit };
  }
  async find(code: string) {
    const user = await this.db.getRepository(User).findOneBy({ code });
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
      const user = await repository.save(repository.create({ id: randomUUID(), code: createCode('USR'), fullName: dto.fullName, email: dto.email, passwordHash, role: dto.role || 'STUDENT', isActive: dto.isActive ?? true }));
      return this.users.publicUser(user);
    } catch (error) { rethrowDatabaseError(error); }
  }
  async update(code: string, dto: UpdateAdminUserDto, actorId: string) {
    try {
      return await this.db.transaction(async manager => {
        const user = await manager.getRepository(User).createQueryBuilder('user').addSelect('user.googleId').where('user.code = :code', { code }).setLock('pessimistic_write').getOne();
        if (!user) throw new NotFoundException('Không tìm thấy người dùng.');
        if (actorId === user.id && dto.role !== undefined && dto.role !== user.role) throw new ConflictException('Không được tự đổi vai trò của mình.');
        if (actorId === user.id && dto.isActive === false) throw new ConflictException('Không được tự khóa tài khoản đang đăng nhập.');
        if (dto.role !== undefined && dto.role !== user.role && await manager.existsBy(Enrollment, { studentId: user.id })) {
          throw new ConflictException('Không đổi vai trò người dùng đã có lịch sử ghi danh.');
        }
        if (dto.email !== undefined && dto.email !== user.email && user.googleId) throw new ConflictException('Không đổi email của tài khoản đã liên kết Google.');
        const revoke = (dto.role !== undefined && dto.role !== user.role) || (dto.email !== undefined && dto.email !== user.email) || dto.isActive === false;
        if (dto.fullName !== undefined) user.fullName = dto.fullName;
        if (dto.email !== undefined) user.email = dto.email;
        if (dto.role !== undefined) user.role = dto.role;
        if (dto.isActive !== undefined) user.isActive = dto.isActive;
        const saved = await manager.save(user);
        if (revoke) await manager.delete(AuthSession, { userId: user.id });
        return this.users.publicUser(saved);
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
  async resetPassword(code: string, actorId: string) {
    const password = `Pks@${randomBytes(9).toString('base64url')}`;
    const passwordHash = await this.hash(password);
    await this.db.transaction(async manager => {
      const user = await manager.findOne(User, { where: { code }, lock: { mode: 'pessimistic_write' } });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng.');
      if (user.id === actorId) throw new ConflictException('Không đặt lại mật khẩu của tài khoản đang đăng nhập bằng chức năng này.');
      await this.mail.sendResetPassword(user.email, user.fullName, password);
      user.passwordHash = passwordHash;
      await manager.save(user);
      await manager.delete(AuthSession, { userId: user.id });
    });
    return { message: 'Mật khẩu mới đã được gửi đến email người dùng.' };
  }
  async removeMany(codes: string[], actorId: string) {
    const uniqueCodes = [...new Set(codes)];
    try {
      await this.db.transaction(async manager => {
        const users = await manager.getRepository(User).createQueryBuilder('user').where('user.code IN (:...codes)', { codes: uniqueCodes }).setLock('pessimistic_write').getMany();
        if (users.length !== uniqueCodes.length) throw new NotFoundException('Có tài khoản không tồn tại.');
        if (users.some(user => user.id === actorId)) throw new ConflictException('Không được tự xóa tài khoản đang đăng nhập.');
        if (await manager.getRepository(Enrollment).createQueryBuilder('enrollment').where('enrollment.studentId IN (:...ids)', { ids: users.map(user => user.id) }).getExists()) {
          throw new ConflictException('Có người dùng đã có lịch sử ghi danh, không thể xóa.');
        }
        await manager.remove(users);
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
  async remove(code: string, actorId: string) {
    try {
      await this.db.transaction(async manager => {
        const user = await manager.findOne(User, { where: { code }, lock: { mode: 'pessimistic_write' } });
        if (!user) throw new NotFoundException('Không tìm thấy người dùng.');
        if (user.id === actorId) throw new ConflictException('Không được tự xóa tài khoản đang đăng nhập.');
        if (await manager.existsBy(Enrollment, { studentId: user.id })) throw new ConflictException('Người dùng có lịch sử ghi danh, không thể xóa.');
        await manager.remove(user);
      });
    } catch (error) { rethrowDatabaseError(error); }
  }
}
