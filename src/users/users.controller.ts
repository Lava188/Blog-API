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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '../common/auth.decorator';

@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Throttle({ default: { limit: 2, ttl: 10000 } })
  @Post()
  @Auth({ summary: 'Create a user', responseStatus: 201, responseDesc: 'Create a user successfully' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() dto: CreateUserDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Auth({ summary: 'Get all users', responseStatus: 200, responseDesc: 'Get all users successfully' })
  async getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.svc.getPaginatedUsers(page, limit);
  }

  @Get(':id')
  @Auth({ summary: 'Get a user by id', responseStatus: 200, responseDesc: 'Get a user by id successfully' })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Get(':email')
  @Auth({ summary: 'Get a user by email', responseStatus: 200, responseDesc: 'Get a user by email successfully' })
  findByEmail(@Param('email') email: string) {
    return this.svc.findByEmail(email);
  }

  @Patch(':id')
  @Auth({ summary: 'Update a user', responseStatus: 200, responseDesc: 'Update a user successfully' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Auth({ summary: 'Delete a user', responseStatus: 200, responseDesc: 'Delete a user successfully' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
