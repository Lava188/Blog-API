import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { ActivityLog } from './activity-log.entity';
import { ActivityLogService } from './activity-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ActivityLog])],
  controllers: [UsersController],
  providers: [UsersService, ActivityLogService],
  exports: [UsersService, ActivityLogService],
})
export class UsersModule {}
