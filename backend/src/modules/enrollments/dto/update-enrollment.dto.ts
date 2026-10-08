import { IsIn } from 'class-validator';
import type { EnrollmentStatus } from '../../../database/entities/enrollment.entity';

export class UpdateEnrollmentDto {
  @IsIn(['ENROLLED', 'CANCELLED']) status!: EnrollmentStatus;
}
