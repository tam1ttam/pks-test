import { Transform } from 'class-transformer';
import { IsString, IsUrl, Length, ValidateIf } from 'class-validator';

export class UpdateUserDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 100)
  fullName!: string;
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsUrl({ protocols: ['https'], require_protocol: true })
  avatarUrl?: string | null;
}
