import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 10, ttl: 60000 } })
@UseGuards(AuthGuard('jwt'))
@Controller('users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Throttle({ default: { limit: 2, ttl: 10000 } })
  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'Create a user successfully' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateUserDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Get all users successfully' })
  async getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.svc.getPaginatedUsers(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Get a user by id successfully' })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiResponse({ status: 200, description: 'Get a user by email successfully' })
  findByEmail(@Param('email') email: string) {
    return this.svc.findByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'Update a user successfully' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'Delete a user successfully' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
