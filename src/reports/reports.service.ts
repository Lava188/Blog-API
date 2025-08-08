import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus, ReportTargetType } from './reports.entity';
import { Post } from '../posts/posts.entity';
import { Comment } from '../comments/comments.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly repo: Repository<Report>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
  ) {}

  async reportPost(postId: number, reason: string, reporterId: number) {
    const post = await this.posts.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const report = this.repo.create({
      targetType: ReportTargetType.POST,
      post,
      reason,
      reporter: { id: reporterId } as any,
    });
    return this.repo.save(report);
  }

  async reportComment(commentId: number, reason: string, reporterId: number) {
    const comment = await this.comments.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    const report = this.repo.create({
      targetType: ReportTargetType.COMMENT,
      comment,
      reason,
      reporter: { id: reporterId } as any,
    });
    return this.repo.save(report);
  }

  async listAll(status?: ReportStatus) {
    return this.repo.find({ where: status ? { status } : {}, order: { createdAt: 'DESC' } });
  }

  async resolve(reportId: number, moderatorId: number, note?: string) {
    const report = await this.repo.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    report.status = ReportStatus.RESOLVED;
    report.moderator = { id: moderatorId } as any;
    report.resolutionNote = note;
    report.resolvedAt = new Date();
    return this.repo.save(report);
  }

  async ignore(reportId: number, moderatorId: number, note?: string) {
    const report = await this.repo.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    report.status = ReportStatus.IGNORED;
    report.moderator = { id: moderatorId } as any;
    report.resolutionNote = note;
    report.resolvedAt = new Date();
    return this.repo.save(report);
  }
}
