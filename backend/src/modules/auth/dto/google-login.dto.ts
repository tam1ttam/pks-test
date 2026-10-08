import { IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import type { AuthPortal } from '../../../common/utils/auth-cookie';

export class GoogleLoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8192)
  credential!: string;
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['CLIENT', 'ADMIN']) portal: AuthPortal = 'CLIENT';
}
