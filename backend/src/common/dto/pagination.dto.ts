import { Type, Transform } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class PaginationDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(100000) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MaxLength(160) search?: string;
}
