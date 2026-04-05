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
      useFactory: (configService: ConfigService) => {
        const host = configService.get('DB_HOST') || 'db.ajtowmqmfcdfxmsimvyi.supabase.co';
        const port = parseInt(configService.get('DB_PORT') || '5432');
        
        return {
          type: 'postgres',
          host: host,
          port: port,
          username: configService.get('DB_USERNAME') || 'postgres',
          password: configService.get('DB_PASSWORD') || 'Naruto-Sasuke11',
          database: configService.get('DB_NAME') || 'postgres',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          logging: false,
          ssl: port === 5432 ? { rejectUnauthorized: false } : false,
        };
      },
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
