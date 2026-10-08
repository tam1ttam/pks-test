import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({ imports: [TypeOrmModule.forFeature([User])], controllers: [UsersController, AdminUsersController], providers: [UsersRepository, UsersService, AdminUsersService], exports: [UsersRepository, UsersService] })
export class UsersModule {}
