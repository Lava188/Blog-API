import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthPrivate } from '../common/auth.decorator';
import { IRequest } from '../common/interface/request.interface';
import { ReportStatus } from './reports.entity';
import { Role } from '../users/users.entity';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @AuthPrivate({ summary: 'Report a post', responseStatus: 201, responseDesc: 'Report post created' })
  @Post('post/:postId')
  reportPost(@Param('postId', ParseIntPipe) postId: number, @Body('reason') reason: string, @Request() req: IRequest) {
    return this.reports.reportPost(postId, reason, req.user.id);
  }

  @AuthPrivate({ summary: 'Report a comment', responseStatus: 201, responseDesc: 'Report comment created' })
  @Post('comment/:commentId')
  reportComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body('reason') reason: string,
    @Request() req: IRequest,
  ) {
    return this.reports.reportComment(commentId, reason, req.user.id);
  }

  @AuthPrivate({
    summary: 'List reports (admin only)',
    responseStatus: 200,
    responseDesc: 'Reports fetched',
    roles: [Role.ADMIN],
  })
  @Get()
  listReports(@Query('status') status?: ReportStatus) {
    return this.reports.listAll(status);
  }

  @AuthPrivate({
    summary: 'Resolve a report (admin only)',
    responseStatus: 200,
    responseDesc: 'Report resolved',
    roles: [Role.ADMIN],
  })
  @Patch(':id/resolve')
  resolve(@Param('id', ParseIntPipe) id: number, @Body('note') note: string, @Request() req: IRequest) {
    return this.reports.resolve(id, req.user.id, note);
  }

  @AuthPrivate({
    summary: 'Ignore a report (admin only)',
    responseStatus: 200,
    responseDesc: 'Report ignored',
    roles: [Role.ADMIN],
  })
  @Patch(':id/ignore')
  ignore(@Param('id', ParseIntPipe) id: number, @Body('note') note: string, @Request() req: IRequest) {
    return this.reports.ignore(id, req.user.id, note);
  }
}
