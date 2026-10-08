import { IsUUID, ValidateIf } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID() courseId!: string;
  @ValidateIf((_object, value) => value !== undefined)
  @IsUUID() studentId?: string;
}
