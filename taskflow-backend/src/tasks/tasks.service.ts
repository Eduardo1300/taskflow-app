import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async findAll(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, user_id: userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async create(data: Partial<Task>, userId: string): Promise<Task> {
    // Convert tags string to array if needed
    if (data.tags && typeof data.tags === 'string') {
      data.tags = (data.tags as string).split(',').map(t => t.trim()).filter(t => t);
    }
    
    const task = this.taskRepository.create({
      ...data,
      user_id: userId,
      completed: data.completed || false,
    });
    return this.taskRepository.save(task);
  }

  async update(id: number, data: Partial<Task>, userId: string): Promise<Task> {
    await this.findOne(id, userId);
    
    // Convert tags string to array if needed
    if (data.tags && typeof data.tags === 'string') {
      data.tags = (data.tags as string).split(',').map(t => t.trim()).filter(t => t);
    }
    
    await this.taskRepository.update({ id, user_id: userId }, data);
    return this.findOne(id, userId);
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.taskRepository.delete({ id, user_id: userId });
  }

  async toggleComplete(id: number, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    return this.update(id, { completed: !task.completed }, userId);
  }

  async getStats(userId: string): Promise<{ total: number; completed: number; pending: number }> {
    const tasks = await this.taskRepository.find({ where: { user_id: userId } });
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
    };
  }

  async search(query: string, userId: string): Promise<Task[]> {
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId })
      .andWhere('(task.title ILIKE :query OR task.description ILIKE :query)', { query: `%${query}%` })
      .orderBy('task.created_at', 'DESC')
      .getMany();
  }

  async findByStatus(completed: boolean, userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { user_id: userId, completed },
      order: { created_at: 'DESC' },
    });
  }
}
