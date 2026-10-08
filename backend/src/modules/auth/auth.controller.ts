import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}
  @Post('register') @Throttle({ default: { limit: 10, ttl: 60000 } })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60000 } })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post('google') @HttpCode(200) @Throttle({ default: { limit: 10, ttl: 60000 } })
  google(@Body() dto: GoogleLoginDto) { return this.auth.googleLogin(dto.credential); }
  @Get('me') @UseGuards(JwtAuthGuard)
  me(@CurrentUser() account: AuthUser) { return this.users.publicUser(account.user); }
  @Post('logout') @UseGuards(JwtAuthGuard) @HttpCode(204)
  logout(@CurrentUser() account: AuthUser) { return this.auth.logout(account.sessionId); }
}
