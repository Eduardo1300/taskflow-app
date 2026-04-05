import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiSuggestionHistory } from './ai-suggestions-history.entity';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiSuggestionHistory)
    private aiSuggestionRepository: Repository<AiSuggestionHistory>,
  ) {}

  async findAll(userId?: string): Promise<AiSuggestionHistory[]> {
    const query = this.aiSuggestionRepository.createQueryBuilder('suggestion');
    if (userId) {
      query.where('suggestion.user_id = :userId', { userId });
    }
    return query.orderBy('suggestion.created_at', 'DESC').getMany();
  }

  async create(data: Partial<AiSuggestionHistory>): Promise<AiSuggestionHistory> {
    const suggestion = this.aiSuggestionRepository.create(data);
    return this.aiSuggestionRepository.save(suggestion);
  }

  async updateFeedback(id: string, feedback: string, wasApplied: boolean): Promise<AiSuggestionHistory> {
    await this.aiSuggestionRepository.update(id, {
      feedback,
      was_applied: wasApplied,
    });
    return this.aiSuggestionRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.aiSuggestionRepository.delete(id);
  }
}
