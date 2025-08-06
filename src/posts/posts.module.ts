import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Post } from './posts.entity';
import { Like } from '../likes/likes.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [TypeOrmModule.forFeature([Post, Like]), UsersModule, NotificationsModule],
  exports: [PostsService],
})
export class PostsModule {}
