import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule } from './automation-rule.entity';

@Injectable()
export class AutomationService {
  constructor(
    @InjectRepository(AutomationRule)
    private automationRepository: Repository<AutomationRule>,
  ) {}

  async findAll(userId: string): Promise<AutomationRule[]> {
    return this.automationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async create(data: Partial<AutomationRule>): Promise<AutomationRule> {
    const rule = this.automationRepository.create(data);
    return this.automationRepository.save(rule);
  }

  async update(id: string, userId: string, data: Partial<AutomationRule>): Promise<AutomationRule> {
    await this.automationRepository.update({ id, user_id: userId }, data);
    return this.automationRepository.findOne({ where: { id } });
  }

  async toggle(id: string, userId: string): Promise<AutomationRule> {
    const rule = await this.automationRepository.findOne({ where: { id, user_id: userId } });
    if (rule) {
      await this.automationRepository.update(id, { is_active: !rule.is_active });
    }
    return this.automationRepository.findOne({ where: { id } });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.automationRepository.delete({ id, user_id: userId });
  }

  async execute(id: string, userId: string, context: any): Promise<any> {
    const rule = await this.automationRepository.findOne({ where: { id, user_id: userId } });
    if (!rule || !rule.is_active) return null;

    await this.automationRepository.update(id, { last_executed_at: new Date() });
    return { executed: true, rule: rule.name };
  }
}
