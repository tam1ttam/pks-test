import { IsIn, IsString, Matches, ValidateIf } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import type { EnrollmentStatus } from '../../../database/entities/enrollment.entity';

export class EnrollmentQueryDto extends PaginationDto {
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Matches(/^CRS-[A-F0-9]{12}$/) courseCode?: string;
  @ValidateIf((_object, value) => value !== undefined) @IsString() @Matches(/^USR-[A-F0-9]{12}$/) studentCode?: string;
  @ValidateIf((_object, value) => value !== undefined) @IsIn(['ENROLLED', 'CANCELLED']) status?: EnrollmentStatus;
}
