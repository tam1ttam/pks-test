import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, Matches } from 'class-validator';

export class BulkDeleteUsersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @Matches(/^USR-[A-Z0-9]+$/, { each: true })
  codes!: string[];
}
