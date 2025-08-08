import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from './reports.entity';
import { Post } from '../posts/posts.entity';
import { Comment } from '../comments/comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Post, Comment])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
