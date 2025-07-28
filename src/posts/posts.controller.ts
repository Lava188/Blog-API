import { Controller, Post, Body, Param, Patch, Delete, Request, Get, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { Role } from '../users/users.entity';
import { IRequest } from '../common/interface/request.interface';
import { User } from '../users/users.entity';
import { GetDisLikePostDto, GetLikePostDto } from './dto/get-like-post.dto';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '../common/auth.decorator';

@Throttle({ default: { limit: 5, ttl: 60000 } })
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Auth({ summary: 'Create a post', responseStatus: 201, responseDesc: 'Create a post successfully' })
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req: IRequest) {
    try {
      return await this.postsService.create(createPostDto, Number(req.user.id));
    } catch (err) {
      console.error('[POST /posts] createPost error:', err);
      throw err;
    }
  }

  @Auth({ summary: 'Like a post', responseStatus: 200, responseDesc: 'Like a post successfully' })
  @Throttle({ default: { limit: 3, ttl: 10000 } })
  @Post(':postId/like')
  async likePost(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.postsService.likePost(postId, req.user.id);
  }

  @Auth({ summary: 'Get likes for a post', responseStatus: 200, responseDesc: 'Get likes for a post successfully' })
  @Get(':postId/likes')
  async getLikesForPost(@Param('postId') postId: number): Promise<GetLikePostDto> {
    const likeCount = await this.postsService.countLikes(postId);
    return { postId, likeCount };
  }

  @Auth({
    summary: 'Get dislikes for a post',
    responseStatus: 200,
    responseDesc: 'Get dislikes for a post successfully',
  })
  @Get(':postId/dislikes')
  async getDisLikesForPost(@Param('postId') postId: number): Promise<GetDisLikePostDto> {
    const disLikeCount = await this.postsService.countDisLikes(postId);
    return { postId, disLikeCount };
  }

  @Auth({
    summary: 'Update a post',
    responseStatus: 200,
    responseDesc: 'Update a post successfully',
    roles: [Role.USER, Role.ADMIN],
  })
  @Patch(':id')
  updatePost(@Param('id') id: number, @Body() editPostDto: EditPostDto, @Request() req: IRequest) {
    return this.postsService.update(id, editPostDto, req.user as User);
  }

  @Auth({
    summary: 'Delete a post',
    responseStatus: 200,
    responseDesc: 'Delete a post successfully',
    roles: [Role.ADMIN],
  })
  @Delete(':id')
  deletePost(@Param('id') id: number, @Request() req: IRequest) {
    return this.postsService.remove(id, req.user as User);
  }

  @Auth({
    summary: 'Get all posts with pagination',
    responseStatus: 200,
    responseDesc: 'Get all posts with pagination successfully',
  })
  @Get()
  async getPosts(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.postsService.getPaginatedPosts(page, limit);
  }
}
