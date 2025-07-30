import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { Role } from '../users/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { IRequest } from '../common/interface/request.interface';
import { User } from '../users/users.entity';
import { GetDisLikePostDto, GetLikePostDto } from './dto/get-like-post.dto';
import { Throttle } from '@nestjs/throttler';
import { AuthPrivate, AuthPublic } from '../common/auth.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Throttle({ default: { limit: 5, ttl: 60000 } })
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @AuthPrivate({
    summary: 'Create a post',
    responseStatus: 201,
    responseDesc: 'Create a post successfully',
  })
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|bmp|webp)$/ })],
      }),
    )
    image: Express.Multer.File,
    @Request() req: IRequest,
  ) {
    try {
      return await this.postsService.create(createPostDto, Number(req.user.id), image);
    } catch (err) {
      console.error('[POST /posts] createPost error:', err);
      throw err;
    }
  }

  @AuthPrivate({
    summary: 'Like a post',
    responseStatus: 200,
    responseDesc: 'Like a post successfully',
  })
  @Throttle({ default: { limit: 3, ttl: 10000 } })
  @Post(':postId/like')
  async likePost(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.postsService.likePost(postId, req.user.id);
  }

  @AuthPublic({
    summary: 'Get likes for a post',
    responseStatus: 200,
    responseDesc: 'Get likes for a post successfully',
  })
  @Get(':postId/likes')
  async getLikesForPost(@Param('postId') postId: number): Promise<GetLikePostDto> {
    const likeCount = await this.postsService.countLikes(postId);
    return { postId, likeCount };
  }

  @AuthPublic({
    summary: 'Get dislikes for a post',
    responseStatus: 200,
    responseDesc: 'Get dislikes for a post successfully',
  })
  @Get(':postId/dislikes')
  async getDisLikesForPost(@Param('postId') postId: number): Promise<GetDisLikePostDto> {
    const disLikeCount = await this.postsService.countDisLikes(postId);
    return { postId, disLikeCount };
  }

  @AuthPrivate({
    summary: 'Update a post',
    responseStatus: 200,
    responseDesc: 'Update a post successfully',
    roles: [Role.USER, Role.ADMIN],
  })
  @Patch(':id')
  updatePost(@Param('id') id: number, @Body() editPostDto: EditPostDto, @Request() req: IRequest) {
    return this.postsService.update(id, editPostDto, req.user as User);
  }

  @AuthPrivate({
    summary: 'Delete a post',
    responseStatus: 200,
    responseDesc: 'Delete a post successfully',
    roles: [Role.ADMIN],
  })
  @Delete(':id')
  deletePost(@Param('id') id: number, @Request() req: IRequest) {
    return this.postsService.remove(id, req.user as User);
  }

  @AuthPublic({
    summary: 'Get all posts with pagination',
    responseStatus: 200,
    responseDesc: 'Get all posts with pagination successfully',
  })
  @Get()
  async getPosts(@Query() query: PaginationQueryDto) {
    return this.postsService.getPaginatedPosts(query.page ?? 1, query.limit ?? 10);
  }
}
