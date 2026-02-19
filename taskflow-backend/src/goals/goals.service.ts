import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  async findAll(userId: string): Promise<Goal[]> {
    return this.goalRepository.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  async create(data: Partial<Goal>, userId: string): Promise<Goal> {
    const goal = this.goalRepository.create({ ...data, user_id: userId });
    return this.goalRepository.save(goal);
  }

  async update(id: string, data: Partial<Goal>, userId: string): Promise<Goal> {
    await this.goalRepository.update({ id, user_id: userId }, data);
    return this.goalRepository.findOne({ where: { id } });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.goalRepository.delete({ id, user_id: userId });
  }
}
