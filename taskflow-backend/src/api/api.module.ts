import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './api-key.entity';
import { ApiRateLimit } from './api-rate-limit.entity';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, ApiRateLimit])],
  providers: [ApiService],
  controllers: [ApiController],
  exports: [ApiService],
})
export class ApiModule {}
