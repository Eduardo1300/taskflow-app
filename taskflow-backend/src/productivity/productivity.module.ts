import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductivityMetric } from './productivity-metric.entity';
import { ProductivityInsight } from './productivity-insight.entity';
import { ProductivityService } from './productivity.service';
import { ProductivityController } from './productivity.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductivityMetric, ProductivityInsight]),
  ],
  providers: [ProductivityService],
  controllers: [ProductivityController],
  exports: [ProductivityService],
})
export class ProductivityModule {}
