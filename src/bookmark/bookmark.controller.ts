import { Controller, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { IRequest } from '../common/interface/request.interface';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('posts/:postId/bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a bookmark' })
  @ApiResponse({ status: 201, description: 'Add a bookmark successfully' })
  @Post()
  async add(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.bookmarkService.add(req.user.id, postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove a bookmark' })
  @ApiResponse({ status: 200, description: 'Remove a bookmark successfully' })
  @Delete()
  async remove(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.bookmarkService.remove(req.user.id, postId);
  }
}
