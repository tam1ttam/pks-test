import { BadRequestException, ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { AuthSession } from '../../database/entities/auth-session.entity';
import { User } from '../../database/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly google = new OAuth2Client();
  private readonly dummyHash = bcrypt.hashSync(randomUUID(), 10);
  constructor(
    private readonly users: UsersRepository,
    private readonly userService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
  ) {}

  async register(dto: RegisterDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) throw new BadRequestException('Mật khẩu tối đa 72 byte UTF-8.');
    if (await this.users.findByEmail(dto.email)) throw new ConflictException('Email đã được sử dụng.');
    try {
      const user = await this.users.create({ id: randomUUID(), fullName: dto.fullName, email: dto.email, passwordHash: await bcrypt.hash(dto.password, 10), role: 'STUDENT' });
      return this.userService.publicUser(user);
    } catch (error) { this.handleUnique(error); }
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    const valid = await bcrypt.compare(dto.password, user?.passwordHash || this.dummyHash);
    if (!user?.passwordHash || !valid || Buffer.byteLength(dto.password, 'utf8') > 72) throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    return this.issueSession(user);
  }

  async googleLogin(credential: string) {
    const audience = this.config.get<string>('googleClientId');
    if (!audience) throw new ServiceUnavailableException('Google Sign-In chưa được cấu hình.');
    let payload;
    try {
      payload = (await this.google.verifyIdToken({ idToken: credential, audience })).getPayload();
    } catch { throw new UnauthorizedException('Thông tin đăng nhập Google không hợp lệ hoặc đã hết hạn.'); }
    if (!payload?.sub || !payload.email || !payload.email_verified) throw new UnauthorizedException('Google chưa xác minh email này.');
    let user = await this.users.findByGoogleId(payload.sub);
    if (!user) {
      const email = payload.email.trim().toLowerCase();
      // Do not silently link an existing password account by matching email.
      if (await this.users.findByEmail(email)) throw new ConflictException('Email đã có tài khoản. Vui lòng đăng nhập bằng mật khẩu.');
      try {
        user = await this.users.create({ id: randomUUID(), fullName: (payload.name || email.split('@')[0]).slice(0, 100), email, googleId: payload.sub, role: 'STUDENT' });
      } catch (error) { this.handleUnique(error); }
    }
    if (!user!.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    return this.issueSession(user!);
  }

  private async issueSession(user: User) {
    const ttl = this.config.getOrThrow<number>('jwt.ttl');
    const id = randomUUID();
    await this.sessions.delete({ expiresAt: LessThan(new Date()) });
    await this.sessions.save({ id, userId: user.id, expiresAt: new Date(Date.now() + ttl * 1000) });
    const accessToken = await this.jwt.signAsync({ sub: user.id, sid: id });
    return { accessToken, user: this.userService.publicUser(user) };
  }
  async logout(sessionId: string) { await this.sessions.delete(sessionId); }
  private handleUnique(error: unknown): never {
    if ((error as { code?: string }).code === '23505') throw new ConflictException('Email hoặc tài khoản Google đã được sử dụng.');
    throw error;
  }
}
