import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './posts.entity';
import { EditPostDto } from './dto/edit-post.dto';
import { Role } from '../users/users.entity';
import { User } from '../users/users.entity';
import { Like } from '../likes/likes.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { LikeDto } from '../likes/dto/like.dto';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId,
    });
    await this.cacheManager.del('all_posts');
    return this.postRepository.save(post);
  }

  async likePost(postId: number, userId: number): Promise<LikeDto> {
    // Check if the post exists in the database
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    const existingLike = await this.likesRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      // If the user has already liked the post, remove the like
      await this.likesRepository.remove(existingLike);
      return { message: 'Post unliked' };
    } else {
      // If the user has not liked the post, create a new like
      const newLike = this.likesRepository.create({ post: { id: postId }, user: { id: userId } });
      await this.likesRepository.save(newLike);
      return { message: 'Post liked' };
    }
  }

  async countLikes(postId: number): Promise<number> {
    return this.likesRepository.count({ where: { post: { id: postId }, isLike: true } });
  }

  async countDisLikes(postId: number): Promise<number> {
    return this.likesRepository.count({ where: { post: { id: postId }, isLike: false } });
  }

  async update(id: number, editPostDto: EditPostDto, user: User) {
    const post = await this.findOne(id);

    if (post.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to edit this post');
    }

    Object.assign(post, editPostDto);
    await this.cacheManager.del('all_posts');
    await this.cacheManager.del(`post_${id}`);
    return this.postRepository.save(post);
  }

  async remove(id: number, user: User) {
    const post = await this.findOne(id);

    if (post.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this post');
    }

    await this.postRepository.delete(id);
    await this.cacheManager.del('all_posts');
    await this.cacheManager.del(`post_${id}`);
    return { message: 'Post deleted successfully' };
  }

  async getAllPosts() {
    const cacheKey = 'all_posts';
    let posts = await this.cacheManager.get(cacheKey);

    if (!posts) {
      posts = await this.postRepository.find();
      await this.cacheManager.set(cacheKey, posts, 60);
    }

    return posts;
  }

  async getPostById(id: number) {
    const cacheKey = `post_${id}`;
    let post = await this.cacheManager.get(cacheKey);

    if (!post) {
      post = await this.postRepository.findOne({ where: { id } });
      if (!post) throw new NotFoundException('Post not found');
      await this.cacheManager.set(cacheKey, post, 60);
    }
    return post;
  }

  async getPaginatedPosts(page: number, limit: number) {
    const [posts, total] = await this.postRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return {
      data: posts,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
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
