import { IsString, Matches, ValidateIf } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString() @Matches(/^CRS-[A-F0-9]{12}$/) courseCode!: string;
  @ValidateIf((_object, value) => value !== undefined)
  @IsString() @Matches(/^USR-[A-F0-9]{12}$/) studentCode?: string;
}
