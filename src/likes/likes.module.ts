import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './likes.entity';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  controllers: [LikesController],
  providers: [LikesService],
  imports: [TypeOrmModule.forFeature([Like]), UsersModule, PostsModule, CommentsModule],
  exports: [LikesService],
})
export class LikesModule {}
