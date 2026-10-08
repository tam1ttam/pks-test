import { Transform } from 'class-transformer';
import { IsBoolean, IsString, MaxLength, ValidateIf } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CourseQueryDto extends PaginationDto {
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MaxLength(80) category?: string;
  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean() isPublished?: boolean;
}
