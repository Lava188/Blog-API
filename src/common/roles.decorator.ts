import { SetMetadata } from '@nestjs/common';
import { Role } from '../users/users.entity';

export const ROLESKEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLESKEY, roles);
