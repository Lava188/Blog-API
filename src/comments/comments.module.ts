import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
// import { LikesModule } from 'src/likes/likes.module';
import { Like } from '../likes/likes.entity';
// import { Post } from 'src/posts/posts.entity';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [TypeOrmModule.forFeature([Comment, Like]), UsersModule],
  exports: [CommentsService],
})
export class CommentsModule {}
