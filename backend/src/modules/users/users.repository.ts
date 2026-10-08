import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}
  findById(id: string) { return this.repository.findOneBy({ id }); }
  findByEmail(email: string) {
    return this.repository.createQueryBuilder('user').addSelect('user.passwordHash').where('user.email = :email', { email }).getOne();
  }
  findByGoogleId(googleId: string) { return this.repository.findOneBy({ googleId }); }
  create(data: Partial<User>) { return this.repository.save(this.repository.create(data)); }
  async updateProfile(id: string, fullName: string, avatarUrl?: string | null) {
    await this.repository.update(id, { fullName, ...(avatarUrl !== undefined && { avatarUrl }) });
    return this.findById(id);
  }
}
