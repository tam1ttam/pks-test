import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import type { User } from '../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}
  publicUser(user: User) {
    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role, createdAt: user.createdAt };
  }
  async update(id: string, fullName: string) {
    const user = await this.users.updateName(id, fullName);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản.');
    return this.publicUser(user);
  }
}
