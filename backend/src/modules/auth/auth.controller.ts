import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { UsersService } from '../users/users.service';
import { ADMIN_COOKIE, CLIENT_COOKIE, cookieName, cookieOptions } from '../../common/utils/auth-cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}
  @Post('register') @Throttle({ default: { limit: 10, ttl: 60000 } })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(dto);
    response.cookie(cookieName(dto.portal), result.accessToken, cookieOptions(result.maxAge));
    return { user: result.user };
  }
  @Post('google') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60000 } })
  async google(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.googleLogin(dto.credential, dto.portal);
    response.cookie(cookieName(dto.portal), result.accessToken, cookieOptions(result.maxAge));
    return { user: result.user };
  }
  @Get('me') @UseGuards(JwtAuthGuard)
  me(@CurrentUser() account: AuthUser) { return this.users.publicUser(account.user); }
  @Post('logout') @UseGuards(JwtAuthGuard) @HttpCode(204)
  async logout(@CurrentUser() account: AuthUser, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(account.sessionId);
    response.clearCookie(request.headers['x-pks-portal'] === 'admin' ? ADMIN_COOKIE : CLIENT_COOKIE, cookieOptions());
  }
}
