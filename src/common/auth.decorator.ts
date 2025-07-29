import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from './roles.guard';
import { Role } from '../users/users.entity';
import { ROLESKEY } from './roles.decorator';

export function AuthPrivate(options: {
  summary: string;
  responseStatus?: number;
  responseDesc?: string;
  roles?: Role[];
}) {
  const decorators = [
    UseGuards(AuthGuard('jwt'), RolesGuard),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: options.summary }),
    ApiResponse({
      status: options.responseStatus ?? 200,
      description: options.responseDesc ?? 'Success',
    }),
  ];
  if (options.roles && options.roles.length > 0) {
    decorators.push(SetMetadata(ROLESKEY, options.roles));
  }
  return applyDecorators(...decorators);
}

export function AuthPublic(options: { summary: string; responseStatus?: number; responseDesc?: string }) {
  const decorators = [
    ApiOperation({ summary: options.summary }),
    ApiResponse({
      status: options.responseStatus ?? 200,
      description: options.responseDesc ?? 'Success',
    }),
  ];
  return applyDecorators(...decorators);
}
