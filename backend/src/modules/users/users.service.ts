import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import type { User } from '../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}
  publicUser(user: User) {
    return { code: user.code, fullName: user.fullName, email: user.email, role: user.role, isActive: user.isActive, avatarUrl: user.avatarUrl, createdAt: user.createdAt };
  }
  async update(id: string, fullName: string, avatarUrl?: string | null) {
    const user = await this.users.updateProfile(id, fullName, avatarUrl);
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản.');
    return this.publicUser(user);
  }
}
