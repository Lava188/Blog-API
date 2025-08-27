import { IsEnum } from 'class-validator';
import { Role } from '../users.entity';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
