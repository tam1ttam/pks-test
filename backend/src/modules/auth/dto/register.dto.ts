import { Transform } from 'class-transformer';
import { IsString, Length, MinLength } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 100)
  fullName!: string;
  @MinLength(8)
  declare password: string;
}
