import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comments.entity';
import { User } from '../users/users.entity';
import { CreateCommentDto } from './dto/create-comments.dto';
import { EditCommentDto } from './dto/edit-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
  ) {}

  async create(
    postId: number,
    dto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    // const parentCommentId = dto.parent_comment_id ? dto.parent_comment_id : null;
    const comment = this.commentsRepo.create({
      content: dto.content,
      postId,
    });
    return this.commentsRepo.save(comment);
  }

  async replyComment(
    commentId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const parentComment = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    const newComment = this.commentsRepo.create({
      ...createCommentDto,
      authorId: userId,
    });

    await this.commentsRepo.save(newComment);
    return { message: 'Comment replied successfully', data: newComment };
  }

  async findAllByPost(postId: number): Promise<Comment[]> {
    return this.commentsRepo.find({ where: { postId } });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepo.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }
    return comment;
  }

  async update(id: number, dto: EditCommentDto, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.authorId !== user.id) {
      throw new ForbiddenException(`You can only edit your own comments.`);
    }
    comment.content = dto.content;
    return this.commentsRepo.save(comment);
  }

  async remove(id: number, user: User): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.authorId !== user.id) {
      throw new ForbiddenException(`You can only delete your own comments.`);
    }

    await this.commentsRepo.delete(id);
  }
}
