import { IsIn, IsUUID, ValidateIf } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import type { EnrollmentStatus } from '../../../database/entities/enrollment.entity';

export class EnrollmentQueryDto extends PaginationDto {
  @ValidateIf((_object, value) => value !== undefined) @IsUUID() courseId?: string;
  @ValidateIf((_object, value) => value !== undefined) @IsUUID() studentId?: string;
  @ValidateIf((_object, value) => value !== undefined) @IsIn(['ENROLLED', 'CANCELLED']) status?: EnrollmentStatus;
}
