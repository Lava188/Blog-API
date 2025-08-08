import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
  Query,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Throttle } from '@nestjs/throttler';
import { AuthPrivate } from '../common/auth.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { IRequest } from '../common/interface/request.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivityLogService } from './activity-log.service';
import { Role } from './users.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('users')
export class UsersController {
  constructor(
    private readonly svc: UsersService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Throttle({ default: { limit: 2, ttl: 10000 } })
  @Post()
  @AuthPrivate({
    summary: 'Create a user',
    responseStatus: 201,
    responseDesc: 'Create a user successfully',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateUserDto) {
    return this.svc.create(dto);
  }

  @Get()
  @AuthPrivate({
    summary: 'Get all users',
    responseStatus: 200,
    responseDesc: 'Get all users successfully',
    roles: [Role.ADMIN],
  })
  async getUsers(@Query() query: PaginationQueryDto) {
    return this.svc.getPaginatedUsers(query.page ?? 1, query.limit ?? 10);
  }

  @Get('id/:id')
  @AuthPrivate({
    summary: 'Get a user by id',
    responseStatus: 200,
    responseDesc: 'Get a user by id successfully',
    roles: [Role.ADMIN],
  })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Get('email/:email')
  @AuthPrivate({
    summary: 'Get a user by email',
    responseStatus: 200,
    responseDesc: 'Get a user by email successfully',
    roles: [Role.ADMIN],
  })
  findByEmail(@Param('email') email: string) {
    return this.svc.findByEmail(email);
  }

  @Patch('profile')
  @AuthPrivate({
    summary: 'Update user profile',
    responseStatus: 200,
    responseDesc: 'Update user profile successfully',
  })
  async updateProfile(@Body() dto: UpdateProfileDto, @Request() req: IRequest) {
    return this.svc.updateProfile(req.user.id.toString(), dto);
  }

  @Delete(':id')
  @AuthPrivate({
    summary: 'Delete a user',
    responseStatus: 200,
    responseDesc: 'Delete a user successfully',
    roles: [Role.ADMIN],
  })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Patch('change-password')
  @AuthPrivate({
    summary: 'Change user password',
    responseStatus: 200,
    responseDesc: 'Change user password successfully',
  })
  async changePassword(@Body() dto: ChangePasswordDto, @Request() req: IRequest) {
    return this.svc.changePassword(req.user.id, dto.oldPassword, dto.newPassword);
  }

  @Patch(':id')
  @AuthPrivate({
    summary: 'Update a user',
    responseStatus: 200,
    responseDesc: 'Update a user successfully',
    roles: [Role.ADMIN],
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/role')
  @AuthPrivate({
    summary: 'Update a user role (admin only)',
    responseStatus: 200,
    responseDesc: 'Update a user role successfully',
    roles: [Role.ADMIN],
  })
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserRoleDto) {
    return this.svc.updateRole(id, dto.role);
  }

  @Patch(':id/ban')
  @AuthPrivate({
    summary: 'Ban a user (admin only)',
    responseStatus: 200,
    responseDesc: 'Ban a user successfully',
    roles: [Role.ADMIN],
  })
  banUser(@Param('id', ParseIntPipe) id: number, @Body('reason') reason?: string) {
    return this.svc.banUser(id, reason);
  }

  @Patch(':id/unban')
  @AuthPrivate({
    summary: 'Unban a user (admin only)',
    responseStatus: 200,
    responseDesc: 'Unban a user successfully',
    roles: [Role.ADMIN],
  })
  unbanUser(@Param('id', ParseIntPipe) id: number) {
    return this.svc.unbanUser(id);
  }

  @Get('activity-log')
  @AuthPrivate({
    summary: 'Get user activity log',
    responseStatus: 200,
    responseDesc: 'Get user activity log successfully',
  })
  async getActivityLog(@Request() req: IRequest) {
    return this.activityLogService.getLogsByUser(req.user.id);
  }

  @Get('activity-log/:userId')
  @AuthPrivate({
    summary: 'Get activity log of a specific user (admin only)',
    responseStatus: 200,
    responseDesc: 'Get specific user activity log successfully',
    roles: [Role.ADMIN],
  })
  async getActivityLogByUserId(@Param('userId') userId: string) {
    return this.activityLogService.getLogsByUser(Number(userId));
  }
}
