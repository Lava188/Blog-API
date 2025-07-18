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

  async create(
    postId: number,
    dto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = this.commentsRepo.create({
      content: dto.content,
      postId,
      authorId: user.id,
    });
    return this.commentsRepo.save(comment);
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
