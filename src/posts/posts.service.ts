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
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId,
    });
    return this.postRepository.save(post);
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
