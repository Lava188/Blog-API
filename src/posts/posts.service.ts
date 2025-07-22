import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './posts.entity';
import { EditPostDto } from './dto/edit-post.dto';
import { Role } from '../users/users.entity';
import { User } from '../users/users.entity';
import { Like } from '../likes/likes.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { LikeDto } from '../likes/dto/like.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId,
    });
    return this.postRepository.save(post);
  }

  async likePost(postId: number, userId: number): Promise<LikeDto> {
    // Check if the post exists in the database
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      // If the post does not exist, throw an exception with a 404 status code
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    // Check if the user has already liked the post
    const existingLike = await this.likesRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      // If the user has already liked the post, remove the like
      await this.likesRepository.remove(existingLike);
      return { message: 'Post unliked'}
    } else {
      // If the user has not liked the post, create a new like
      const newLike = this.likesRepository.create({postId,userId,});
      await this.likesRepository.save(newLike);
      return { message: 'Post liked' };
    }
  }

  async update(id: number, editPostDto: EditPostDto, user: User) {
    const post = await this.findOne(id);

    if (post.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to edit this post',
      );
    }

    Object.assign(post, editPostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number, user: User) {
    const post = await this.findOne(id);

    if (post.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    await this.postRepository.delete(id);
    return { message: 'Post deleted successfully' };
  }

  private async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }
}
