import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CategoriesModule } from './categories/categories.module';
import { GoalsModule } from './goals/goals.module';
import { CollaborationsModule } from './collaborations/collaborations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AiModule } from './ai/ai.module';
import { ProductivityModule } from './productivity/productivity.module';
import { ApiModule } from './api/api.module';
import { AutomationModule } from './automation/automation.module';
import { SetupController } from './setup/setup.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TasksModule,
    ProfilesModule,
    CategoriesModule,
    GoalsModule,
    CollaborationsModule,
    NotificationsModule,
    IntegrationsModule,
    WebhooksModule,
    AiModule,
    ProductivityModule,
    ApiModule,
    AutomationModule,
  ],
  controllers: [SetupController, HealthController],
})
export class AppModule {}
