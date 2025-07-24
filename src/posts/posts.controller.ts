import { Controller, Post, Body, Param, UseGuards, Patch, Delete, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { Roles } from '../common/roles.decorator';
import { Role } from '../users/users.entity';
import { RolesGuard } from '../common/roles.guard';
import { IRequest } from '../common/interface/request.interface';
import { User } from '../users/users.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetDisLikePostDto, GetLikePostDto } from './dto/get-like-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Create a post successfully' })
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req: IRequest) {
    try {
      return await this.postsService.create(createPostDto, Number(req.user.id));
    } catch (err) {
      console.error('[POST /posts] createPost error:', err);
      throw err;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Like a post' })
  @ApiResponse({ status: 200, description: 'Like a post successfully' })
  @Post(':postId/like')
  async likePost(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.postsService.likePost(postId, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get likes for a post' })
  @ApiResponse({ status: 200, description: 'Get likes for a post successfully' })
  @Get(':postId/likes')
  async getLikesForPost(@Param('postId') postId: number): Promise<GetLikePostDto> {
    const likeCount = await this.postsService.countLikes(postId);
    return { postId, likeCount };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get dislikes for a post' })
  @ApiResponse({ status: 200, description: 'Get dislikes for a post successfully' })
  @Get(':postId/dislikes')
  async getDisLikesForPost(@Param('postId') postId: number): Promise<GetDisLikePostDto> {
    const disLikeCount = await this.postsService.countDisLikes(postId);
    return { postId, disLikeCount };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, description: 'Update a post successfully' })
  @Roles(Role.USER, Role.ADMIN)
  @Patch(':id')
  updatePost(@Param('id') id: number, @Body() editPostDto: EditPostDto, @Request() req: IRequest) {
    return this.postsService.update(id, editPostDto, req.user as User);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Delete a post successfully' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  deletePost(@Param('id') id: number, @Request() req: IRequest) {
    return this.postsService.remove(id, req.user as User);
  }
}
