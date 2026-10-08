import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from '../../database/entities/auth-session.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [UsersModule, PassportModule, TypeOrmModule.forFeature([AuthSession]), JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('jwt.secret'), signOptions: { expiresIn: config.getOrThrow<number>('jwt.ttl'), issuer: config.getOrThrow('jwt.issuer'), audience: config.getOrThrow('jwt.audience'), algorithm: 'HS256' } }) })],
  controllers: [AuthController], providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
