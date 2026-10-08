import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { AuthSession } from '../../../database/entities/auth-session.entity';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>, private readonly users: UsersRepository) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.getOrThrow<string>('jwt.secret'), issuer: config.getOrThrow('jwt.issuer'), audience: config.getOrThrow('jwt.audience'), algorithms: ['HS256'] });
  }
  async validate(payload: { sub?: string; sid?: string }) {
    if (!payload.sub || !payload.sid || !isUUID(payload.sub) || !isUUID(payload.sid)) throw new UnauthorizedException();
    const session = await this.sessions.findOneBy({ id: payload.sid, userId: payload.sub });
    if (!session || session.expiresAt <= new Date()) throw new UnauthorizedException('Phiên đăng nhập đã kết thúc.');
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { user, sessionId: session.id };
  }
}
