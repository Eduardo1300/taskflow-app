import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  async create(data: Partial<Notification>, userId: string): Promise<Notification> {
    const notification = this.notificationRepo.create({ ...data, user_id: userId });
    return this.notificationRepo.save(notification);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepo.update({ id, user_id: userId }, { read: true });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.notificationRepo.delete({ id, user_id: userId });
  }
}
