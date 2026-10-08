import { IsIn } from 'class-validator';
import type { EnrollmentStatus } from '../../../database/entities/enrollment.entity';

export class UpdateEnrollmentDto {
  @IsIn(['ENROLLED', 'CANCEL_REQUESTED', 'CANCELLED']) status!: EnrollmentStatus;
}
