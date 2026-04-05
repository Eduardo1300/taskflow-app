import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './integration.entity';
import { CalendarEvent } from './calendar-event.entity';
import { IntegrationSyncHistory } from './integration-sync-history.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepo: Repository<Integration>,
    @InjectRepository(CalendarEvent)
    private calendarEventRepo: Repository<CalendarEvent>,
    @InjectRepository(IntegrationSyncHistory)
    private syncHistoryRepo: Repository<IntegrationSyncHistory>,
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

  async findCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    return this.calendarEventRepo.find({ where: { user_id: userId } });
  }

  async createCalendarEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const event = this.calendarEventRepo.create(data);
    return this.calendarEventRepo.save(event);
  }

  async getSyncHistory(integrationId: string): Promise<IntegrationSyncHistory[]> {
    return this.syncHistoryRepo.find({
      where: { integration_id: integrationId },
      order: { created_at: 'DESC' },
    });
  }

  async createSyncHistory(data: Partial<IntegrationSyncHistory>): Promise<IntegrationSyncHistory> {
    const history = this.syncHistoryRepo.create(data);
    return this.syncHistoryRepo.save(history);
  }
}
