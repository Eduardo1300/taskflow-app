import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';
import { ApiRateLimit } from './api-rate-limit.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(ApiRateLimit)
    private rateLimitRepository: Repository<ApiRateLimit>,
  ) {}

  async findAllKeys(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async createKey(data: Partial<ApiKey>): Promise<ApiKey> {
    const key = this.apiKeyRepository.create({
      ...data,
      key: `tf_${uuidv4().replace(/-/g, '')}`,
    });
    return this.apiKeyRepository.save(key);
  }

  async deleteKey(id: string, userId: string): Promise<void> {
    await this.apiKeyRepository.delete({ id, user_id: userId });
  }

  async toggleKey(id: string, userId: string): Promise<ApiKey> {
    const key = await this.apiKeyRepository.findOne({ where: { id, user_id: userId } });
    if (key) {
      await this.apiKeyRepository.update(id, { is_active: !key.is_active });
    }
    return this.apiKeyRepository.findOne({ where: { id } });
  }

  async checkRateLimit(keyId: string): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 60 * 1000);

    const rateLimit = await this.rateLimitRepository.findOne({
      where: { api_key_id: keyId, window_start: windowStart },
    });

    const key = await this.apiKeyRepository.findOne({ where: { id: keyId } });
    if (!key || !key.is_active) return false;

    const limit = key.rate_limit || 100;
    const currentCount = rateLimit?.requests_count || 0;

    if (currentCount >= limit) return false;

    if (rateLimit) {
      await this.rateLimitRepository.update(rateLimit.id, {
        requests_count: currentCount + 1,
      });
    } else {
      await this.rateLimitRepository.save({
        api_key_id: keyId,
        requests_count: 1,
        window_start: windowStart,
      });
    }

    await this.apiKeyRepository.update(keyId, { last_used_at: now });
    return true;
  }

  async validateKey(key: string): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({
      where: { key, is_active: true },
    });
  }
}
