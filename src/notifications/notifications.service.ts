import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notifications.entity';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(recipent: User, type: string, content: string) {
    const notification = this.notificationRepo.create({
      recipent,
      type,
      content,
    });
    return this.notificationRepo.save(notification);
  }

  async getNotification(userId: number) {
    return this.notificationRepo.find({
      where: { recipent: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number) {
    const noti = await this.notificationRepo.findOne({ where: { id, recipent: { id: userId } } });
    if (!noti) {
      throw new Error('Notification not found or no permission');
    }
    noti.isRead = true;
    return this.notificationRepo.save(noti);
  }

  async delete(id: number, userId: number) {
    const noti = await this.notificationRepo.findOne({ where: { id, recipent: { id: userId } } });
    if (!noti) {
      throw new Error('Notification not found or no permission');
    }
    await this.notificationRepo.remove(noti);
    return { message: 'Deleted' };
  }
}
