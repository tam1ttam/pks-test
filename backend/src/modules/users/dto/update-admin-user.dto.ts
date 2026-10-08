import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateAdminUserDto extends PartialType(CreateUserDto, { skipNullProperties: false }) {}
