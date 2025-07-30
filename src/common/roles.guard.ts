import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLESKEY } from './roles.decorator';
import { Role } from '../users/users.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(ROLESKEY, ctx.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = ctx.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User role not found');
    }

    if (!requiredRoles.includes(user.role as Role)) {
      throw new ForbiddenException(`Access denied: User role ${user.role} does not have permission`);
    }

    return true;
  }
}
