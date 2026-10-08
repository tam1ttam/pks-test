import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsString, IsUrl, Length, Max, Min, ValidateIf } from 'class-validator';

export class CreateCourseDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(2, 160) name!: string;
  @ValidateIf(object => !object.categoryCode)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(1, 80) category?: string;
  @ValidateIf(object => !object.category)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(1, 16) categoryCode?: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(2, 120) instructor!: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(1, 500) shortDescription!: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(1, 10000) description!: string;
  @IsInt() @Min(0) @Max(999999999999) tuition!: number;
  @IsInt() @Min(1) @Max(100000) capacity!: number;
  @ValidateIf((_object, value) => value !== undefined) @IsBoolean() isPublished?: boolean;
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsUrl({ protocols: ['https'], require_protocol: true }) imageUrl?: string | null;
}
