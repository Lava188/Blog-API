import { Controller, Post, Delete, Param, Request, Get } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { IRequest } from '../common/interface/request.interface';
import { AuthPrivate } from '../common/auth.decorator';

@Controller('posts/:postId/bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @AuthPrivate({
    summary: 'Add a bookmark',
    responseStatus: 201,
    responseDesc: 'Add a bookmark successfully',
  })
  @Post()
  async add(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.bookmarkService.add(req.user.id, postId);
  }

  @AuthPrivate({
    summary: 'Remove a bookmark',
    responseStatus: 200,
    responseDesc: 'Remove a bookmark successfully',
  })
  @Delete()
  async remove(@Param('postId') postId: number, @Request() req: IRequest) {
    return this.bookmarkService.remove(req.user.id, postId);
  }

  @AuthPrivate({
    summary: 'List my bookmarks',
    responseStatus: 200,
    responseDesc: 'List user bookmarks successfully',
  })
  @Get()
  async listMine(@Request() req: IRequest) {
    return this.bookmarkService.listByUser(req.user.id);
  }
}
