import { Controller, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { IRequest } from '../common/interface/request.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts/:postId/bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async add(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.bookmarkService.add(req.user.id, postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async remove(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.bookmarkService.remove(req.user.id, postId);
  }
}
