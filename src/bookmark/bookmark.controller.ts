import { Controller, Post, Delete, Param, Request } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { IRequest } from '../common/interface/request.interface';

@Controller('posts')
export class BookmarkController {
    constructor(private readonly bookmarkService: BookmarkService) {}

    @Post(':postId/bookmark')
    async addBookmark( @Param('postId') postId: number, @Request() req: IRequest) {
        return this.bookmarkService.addBookmark(req.user.id, postId);
    }

    @Delete(':postId/bookmark')
    async removeBookmark( @Param('postId') postId: number, @Request() req: IRequest) {
        return this.bookmarkService.removeBookmark(req.user.id, postId);
    }
}