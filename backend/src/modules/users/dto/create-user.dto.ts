import { IsBoolean, IsIn, ValidateIf } from 'class-validator';
import { RegisterDto } from '../../auth/dto/register.dto';
import type { UserRole } from '../../../database/entities/user.entity';

export class CreateUserDto extends RegisterDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['STUDENT', 'ADMIN']) role?: UserRole;
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean() isActive?: boolean;
}
