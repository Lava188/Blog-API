import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './bookmark.entity';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { Post } from '../posts/posts.entity';
import { User } from '../users/users.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Bookmark, Post, User])],
    providers: [BookmarkService],
    controllers: [BookmarkController],
})
export class BookmarkModule {}
