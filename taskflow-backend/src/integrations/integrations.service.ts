import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './integration.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepo: Repository<Integration>,
  ) {}

  async findAll(userId: string): Promise<Integration[]> {
    return this.integrationRepo.find({ where: { user_id: userId } });
  }

  async create(data: Partial<Integration>, userId: string): Promise<Integration> {
    const integration = this.integrationRepo.create({ ...data, user_id: userId });
    return this.integrationRepo.save(integration);
  }

  async update(id: string, data: Partial<Integration>, userId: string): Promise<Integration> {
    await this.integrationRepo.update({ id, user_id: userId }, data);
    return this.integrationRepo.findOne({ where: { id } });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.integrationRepo.delete({ id, user_id: userId });
  }
}
