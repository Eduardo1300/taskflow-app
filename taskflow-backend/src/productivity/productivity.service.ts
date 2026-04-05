import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductivityMetric } from './productivity-metric.entity';
import { ProductivityInsight } from './productivity-insight.entity';

@Injectable()
export class ProductivityService {
  constructor(
    @InjectRepository(ProductivityMetric)
    private metricsRepository: Repository<ProductivityMetric>,
    @InjectRepository(ProductivityInsight)
    private insightsRepository: Repository<ProductivityInsight>,
  ) {}

  async getMetrics(userId: string, startDate?: Date, endDate?: Date): Promise<ProductivityMetric[]> {
    const query = this.metricsRepository.createQueryBuilder('metric')
      .where('metric.user_id = :userId', { userId });

    if (startDate) {
      query.andWhere('metric.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('metric.date <= :endDate', { endDate });
    }

    return query.orderBy('metric.date', 'DESC').getMany();
  }

  async createMetric(data: Partial<ProductivityMetric>): Promise<ProductivityMetric> {
    const metric = this.metricsRepository.create(data);
    return this.metricsRepository.save(metric);
  }

  async getInsights(userId: string): Promise<ProductivityInsight[]> {
    return this.insightsRepository.find({
      where: { user_id: userId, is_dismissed: false },
      order: { created_at: 'DESC' },
    });
  }

  async createInsight(data: Partial<ProductivityInsight>): Promise<ProductivityInsight> {
    const insight = this.insightsRepository.create(data);
    return this.insightsRepository.save(insight);
  }

  async dismissInsight(id: string): Promise<ProductivityInsight> {
    await this.insightsRepository.update(id, { is_dismissed: true });
    return this.insightsRepository.findOne({ where: { id } });
  }

  async getTodayStats(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metric = await this.metricsRepository.findOne({
      where: { user_id: userId, date: today },
    });

    return metric || { tasks_created: 0, tasks_completed: 0, productivity_score: 0 };
  }
}
