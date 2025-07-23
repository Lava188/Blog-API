import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import { User } from '../users/users.entity';
import { Post } from '../posts/posts.entity';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async addBookmark(userId: number, postId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!user || !post) {
      throw new Error('User or Post not found');
    }

    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { user: user, post: post },
    });

    if (existingBookmark) {
      throw new BadRequestException('Post is already bookmarked');
    }

    const newBookmark = this.bookmarkRepository.create({ user, post });
    await this.bookmarkRepository.save(newBookmark);

    return { message: 'Post bookmarked successfully' };
  }

  async removeBookmark(userId: number, postId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!user || !post) {
      throw new Error('User or Post not found');
    }

    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { user: user, post: post },
    });

    if (!existingBookmark) {
      return { message: 'Post is not bookmarked' };
    }

    await this.bookmarkRepository.remove(existingBookmark);

    return { message: 'Bookmark removed successfully' };
  }
}
