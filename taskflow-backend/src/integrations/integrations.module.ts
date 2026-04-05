import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './integration.entity';
import { CalendarEvent } from './calendar-event.entity';
import { IntegrationSyncHistory } from './integration-sync-history.entity';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration, CalendarEvent, IntegrationSyncHistory]),
  ],
  providers: [IntegrationsService],
  controllers: [IntegrationsController],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
