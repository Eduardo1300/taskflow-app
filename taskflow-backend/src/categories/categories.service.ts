import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(userId?: string): Promise<Category[]> {
    if (userId) {
      return this.categoryRepository.find({ where: { user_id: userId }, order: { name: 'ASC' } });
    }
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async create(data: Partial<Category>, userId?: string): Promise<Category> {
    const category = this.categoryRepository.create({
      ...data,
      user_id: userId || null,
    });
    return this.categoryRepository.save(category);
  }

  async update(id: number, data: Partial<Category>, userId?: string): Promise<Category> {
    await this.categoryRepository.update({ id, user_id: userId }, data);
    return this.categoryRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
