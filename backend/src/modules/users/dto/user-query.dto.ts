import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, ValidateIf } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import type { UserRole } from '../../../database/entities/user.entity';

export class UserQueryDto extends PaginationDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['STUDENT', 'ADMIN']) role?: UserRole;
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean() isActive?: boolean;
}
