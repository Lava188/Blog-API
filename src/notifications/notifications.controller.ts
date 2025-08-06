import { Controller, Delete, Get, Param, Patch, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { IRequest } from '../common/interface/request.interface';
import { AuthPrivate } from '../common/auth.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @AuthPrivate({
    summary: 'Get my notification',
    responseStatus: 200,
    responseDesc: 'Get my notification successfully',
  })
  @Get()
  async getMyNotifications(@Request() req: IRequest) {
    return this.notificationService.getNotification(req.user.id);
  }

  @AuthPrivate({
    summary: 'Read my notification',
    responseStatus: 200,
    responseDesc: 'Mark my notification as read',
  })
  @Patch(':id/read')
  async markasRead(@Param('id') id: string, @Request() req: IRequest) {
    return this.notificationService.markAsRead(Number(id), Number(req.user.id));
  }

  @AuthPrivate({
    summary: 'Delete my notification',
    responseStatus: 200,
    responseDesc: 'Delete my notification successfully',
  })
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: IRequest) {
    return this.notificationService.delete(Number(id), req.user.id);
  }
}
