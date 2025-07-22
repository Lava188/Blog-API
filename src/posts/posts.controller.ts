import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
  Request,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { Roles } from '../common/roles.decorator';
import { Role } from '../users/users.entity';
import { RolesGuard } from '../common/roles.guard';
import { IRequest } from '../common/interface/request.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req) {
    try {
      return await this.postsService.create(createPostDto, req.user.id);
    } catch (err) {
      console.error('[POST /posts] createPost error:', err);
      throw err;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':postId/like')
  async likePost(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.postsService.likePost(postId, req.user.id)
  }

  @Get(':postId/likes')
  async getLikesForPost(@Param('postId') postId: number) {
    const likeCount = await this.postsService.countLikes(postId);
    return { postId, likeCount };
  }

  @Get(':postId/dislikes')
  async getDisLikesForPost(@Param('postId') postId: number) {
    const disLikeCount = await this.postsService.countDisLikes(postId);
    return { postId, disLikeCount };
  }
  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @Patch(':id')
  updatePost(
    @Param('id') id: number,
    @Body() editPostDto: EditPostDto,
    @Request() req,
  ) {
    return this.postsService.update(id, editPostDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  deletePost(@Param('id') id: number, @Request() req) {
    return this.postsService.remove(id, req.user);
  }
}
