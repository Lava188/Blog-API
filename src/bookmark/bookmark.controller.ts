import { Controller, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { IRequest } from '../common/interface/request.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':postId/bookmark')
  async addBookmark(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.bookmarkService.addBookmark(req.user.id, postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':postId/bookmark')
  async removeBookmark(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.bookmarkService.removeBookmark(req.user.id, postId);
  }
}
