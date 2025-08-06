import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comments.entity';
import { Role, User } from '../users/users.entity';
import { CreateCommentDto } from './dto/create-comments.dto';
import { EditCommentDto } from './dto/edit-comments.dto';
import { Like } from '../likes/likes.entity';
import { LikeDto } from '../likes/dto/like.dto';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NotificationsService } from '../notifications/notifications.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likesRepo: Repository<Like>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationService: NotificationsService,
    private readonly postsService: PostsService,
  ) {}

  async create(postId: number, dto: CreateCommentDto, user: User): Promise<Comment> {
    const comment = this.commentsRepo.create({
      content: dto.content,
      postId,
      authorId: user.id,
    });
    const post = await this.postsService.getPostById(postId);
    if (post.authorId != user.id) {
      await this.notificationService.create(
        post.author, // recipient
        'comment',
        `User ${comment.author} vừa bình luận vào bài viết "${post.title}"`,
      );
    }
    await this.cacheManager.del(`comments_post_${postId}`);
    return this.commentsRepo.save(comment);
  }

  async replyComment(commentId: number, createCommentDto: CreateCommentDto, userId: number) {
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

  async likeComment(commentId: number, userId: number): Promise<LikeDto> {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId } });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }
    const existingLike = await this.likesRepo.findOneBy({ comment: { id: commentId }, user: { id: userId } });
    if (existingLike) {
      // If the user has already liked the comment, remove the like
      await this.likesRepo.remove(existingLike);
      return { message: 'Comment unliked' };
    } else {
      // If the user has not liked the comment, create a new like
      const newLike = this.likesRepo.create({ comment: { id: commentId }, user: { id: userId } });
      await this.likesRepo.save(newLike);
      return { message: 'Comment liked' };
    }
  }

  async countLikes(commentId: number): Promise<number> {
    return this.likesRepo.count({ where: { comment: { id: commentId }, isLike: true } });
  }

  async countDisLikes(commentId: number): Promise<number> {
    return this.likesRepo.count({ where: { comment: { id: commentId }, isLike: false } });
  }

  async findAllByPost(postId: number): Promise<Comment[]> {
    const cacheKey = `comments_post_${postId}`;
    let comments = await this.cacheManager.get<Comment[]>(cacheKey);
    if (!comments) {
      comments = await this.commentsRepo.find({ where: { postId } });
      await this.cacheManager.set(cacheKey, comments, 60);
    }
    return comments;
  }

  async findOne(id: number): Promise<Comment> {
    const comment = (await this.commentsRepo.findOneBy({ id })) ?? undefined;
    if (!comment) throw new NotFoundException(`Comment #${id} not found`);
    return comment;
  }

  async update(id: number, dto: EditCommentDto, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(`You can only edit your own comments.`);
    }
    comment.content = dto.content ?? comment.content;
    await this.cacheManager.del(`comments_post_${comment.postId}`);
    return this.commentsRepo.save(comment);
  }

  async remove(id: number, user: User): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(`You can only delete your own comments.`);
    }

    await this.commentsRepo.delete(id);
    await this.cacheManager.del(`comments_post_${comment.postId}`);
  }

  async getPaginatedCommentsByPost(postId: number, page: number, limit: number) {
    const [comments, total] = await this.commentsRepo.findAndCount({
      where: { postId },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return {
      data: comments,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
