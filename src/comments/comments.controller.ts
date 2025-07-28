import { Controller, Get, Post, Patch, Delete, Body, Param, Request, ParseIntPipe, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comments.dto';
import { EditCommentDto } from './dto/edit-comments.dto';
import { IRequest } from '../common/interface/request.interface';
import { User } from '../users/users.entity';
import { GetDisLikeCommentDto, GetLikeCommentDto } from './dto/get-like-comment.dto';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '../common/auth.decorator';

@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @Auth({ summary: 'Get all comments', responseStatus: 200, responseDesc: 'Get all comments successfully' })
  findAll(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findAllByPost(postId);
  }

  @Get('post/:postId')
  @Auth({
    summary: 'Get paginated comments by post',
    responseStatus: 200,
    responseDesc: 'Get paginated comments by post successfully',
  })
  async getCommentsByPost(
    @Param('postId') postId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.commentsService.getPaginatedCommentsByPost(Number(postId), page, limit);
  }

  @Auth({ summary: 'Like a comment', responseStatus: 200, responseDesc: 'Like a comment successfully' })
  @Throttle({ default: { limit: 3, ttl: 10000 } })
  @Post(':commentId/like')
  async likeComment(@Param('commentId', ParseIntPipe) commentId: number, @Request() req: IRequest) {
    return this.commentsService.likeComment(commentId, req.user.id);
  }

  @Auth({
    summary: 'Get likes for a comment',
    responseStatus: 200,
    responseDesc: 'Get likes for a comment successfully',
  })
  @Get(':commentId/likes')
  async getLikesForComment(@Param('commentId', ParseIntPipe) commentId: number): Promise<GetLikeCommentDto> {
    const likeCount = await this.commentsService.countLikes(commentId);
    return { commentId, likeCount };
  }

  @Auth({
    summary: 'Get dislikes for a comment',
    responseStatus: 200,
    responseDesc: 'Get dislikes for a comment successfully',
  })
  @Get(':commentId/dislikes')
  async getDisLikesForComment(@Param('commentId', ParseIntPipe) commentId: number): Promise<GetDisLikeCommentDto> {
    const disLikeCount = await this.commentsService.countDisLikes(commentId);
    return { commentId, disLikeCount };
  }

  @Auth({ summary: 'Create a comment', responseStatus: 201, responseDesc: 'Create a comment successfully' })
  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post()
  create(@Param('postId', ParseIntPipe) postId: number, @Body() dto: CreateCommentDto, @Request() req: IRequest) {
    return this.commentsService.create(postId, dto, req.user as User);
  }

  @Auth({ summary: 'Update a comment', responseStatus: 200, responseDesc: 'Update a comment successfully' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: EditCommentDto, @Request() req: IRequest) {
    return this.commentsService.update(id, dto, req.user as User);
  }

  @Auth({ summary: 'Delete a comment', responseStatus: 200, responseDesc: 'Delete a comment successfully' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.remove(id, req.user as User);
  }
}
