import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comments.dto';
import { EditCommentDto } from './dto/edit-comments.dto';
import { IRequest } from '../common/interface/request.interface';
import { User } from '../users/users.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetDisLikeCommentDto, GetLikeCommentDto } from './dto/get-like-comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'Get all comments successfully' })
  findAll(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findAllByPost(postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Like a comment' })
  @ApiResponse({ status: 200, description: 'Like a comment successfully' })
  @Post(':commentId/like')
  async likeComment(@Param('commentId', ParseIntPipe) commentId: number, @Request() req: IRequest) {
    return this.commentsService.likeComment(commentId, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get likes for a comment' })
  @ApiResponse({ status: 200, description: 'Get likes for a comment successfully' })
  @Get(':commentId/likes')
  async getLikesForComment(@Param('commentId') commentId: number): Promise<GetLikeCommentDto> {
    const likeCount = await this.commentsService.countLikes(commentId);
    return { commentId, likeCount };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @Get(':commentId/dislikes')
  @ApiOperation({ summary: 'Get dislikes for a comment' })
  @ApiResponse({ status: 200, description: 'Get dislikes for a comment successfully' })
  async getDisLikesForComment(@Param('commentId') commentId: number): Promise<GetDisLikeCommentDto> {
    const disLikeCount = await this.commentsService.countDisLikes(commentId);
    return { commentId, disLikeCount };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({ status: 201, description: 'Create a comment successfully' })
  @Post()
  create(@Param('postId', ParseIntPipe) postId: number, @Body() dto: CreateCommentDto, @Request() req: IRequest) {
    return this.commentsService.create(postId, dto, req.user as User);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Update a comment successfully' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: EditCommentDto, @Request() req: IRequest) {
    return this.commentsService.update(id, dto, req.user as User);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Delete a comment successfully' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.remove(id, req.user as User);
  }
}
