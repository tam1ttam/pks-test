import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import type { AuthPortal } from '../../../common/utils/auth-cookie';

export class LoginDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email!: string;
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string;
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['CLIENT', 'ADMIN']) portal: AuthPortal = 'CLIENT';
}
