import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationConfig } from './notification-config.entity';
import { EmailPreference } from './email-preference.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationConfig)
    private configRepo: Repository<NotificationConfig>,
    @InjectRepository(EmailPreference)
    private emailPrefRepo: Repository<EmailPreference>,
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

  async getConfigs(userId: string): Promise<NotificationConfig[]> {
    return this.configRepo.find({ where: { user_id: userId } });
  }

  async createConfig(data: Partial<NotificationConfig>, userId: string): Promise<NotificationConfig> {
    const config = this.configRepo.create({ ...data, user_id: userId });
    return this.configRepo.save(config);
  }

  async getEmailPreferences(userId: string): Promise<EmailPreference[]> {
    return this.emailPrefRepo.find({ where: { user_id: userId } });
  }

  async createEmailPreference(data: Partial<EmailPreference>): Promise<EmailPreference> {
    const pref = this.emailPrefRepo.create(data);
    return this.emailPrefRepo.save(pref);
  }

  async updateEmailPreference(id: string, data: Partial<EmailPreference>): Promise<EmailPreference> {
    await this.emailPrefRepo.update(id, data);
    return this.emailPrefRepo.findOne({ where: { id } });
  }
}
