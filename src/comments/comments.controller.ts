import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comments.dto';
import { EditCommentDto } from './dto/edit-comments.dto';
import { IRequest } from '../common/interface/request.interface';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findAllByPost(postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':commentId/like')
  async likeComment(@Param('commentId', ParseIntPipe) commentId: number, @Request() req: IRequest) {
    return this.commentsService.likeComment(commentId, req.user.id);
  }

  @Get(':commentId/likes')
  async getLikesForComment(@Param('commentId') commentId: number): Promise<{ commentId: number; likeCount: number }> {
    const likeCount = await this.commentsService.countLikes(commentId);
    return { commentId, likeCount };
  }

  @Get(':commentId/dislikes')
  async getDisLikesForComment(
    @Param('commentId') commentId: number,
  ): Promise<{ commentId: number; disLikeCount: number }> {
    const disLikeCount = await this.commentsService.countDisLikes(commentId);
    return { commentId, disLikeCount };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Param('postId', ParseIntPipe) postId: number, @Body() dto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(postId, dto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: EditCommentDto, @Request() req) {
    return this.commentsService.update(id, dto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.remove(id, req.user);
  }
}
