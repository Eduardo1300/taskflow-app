import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './webhook.entity';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook)
    private webhookRepo: Repository<Webhook>,
  ) {}

  async findAll(userId: string): Promise<Webhook[]> {
    return this.webhookRepo.find({ where: { user_id: userId } });
  }

  async create(data: Partial<Webhook>, userId: string): Promise<Webhook> {
    const webhook = this.webhookRepo.create({ ...data, user_id: userId, secret: crypto.randomUUID() });
    return this.webhookRepo.save(webhook);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.webhookRepo.delete({ id, user_id: userId });
  }
}
