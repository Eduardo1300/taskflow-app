import { Controller, Get, Post, Body, Query, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductivityService } from './productivity.service';

@Controller('productivity')
@UseGuards(AuthGuard('jwt'))
export class ProductivityController {
  constructor(private productivityService: ProductivityService) {}

  @Get('metrics')
  async getMetrics(
    @Request() req,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const metrics = await this.productivityService.getMetrics(
      req.user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return { data: metrics };
  }

  @Post('metrics')
  async createMetric(@Body() body: any, @Request() req) {
    const metric = await this.productivityService.createMetric({
      ...body,
      user_id: req.user.userId,
    });
    return { data: metric };
  }

  @Get('insights')
  async getInsights(@Request() req) {
    const insights = await this.productivityService.getInsights(req.user.userId);
    return { data: insights };
  }

  @Post('insights')
  async createInsight(@Body() body: any, @Request() req) {
    const insight = await this.productivityService.createInsight({
      ...body,
      user_id: req.user.userId,
    });
    return { data: insight };
  }

  @Patch('insights/:id/dismiss')
  async dismissInsight(@Param('id') id: string) {
    const insight = await this.productivityService.dismissInsight(id);
    return { data: insight };
  }

  @Get('today')
  async getTodayStats(@Request() req) {
    const stats = await this.productivityService.getTodayStats(req.user.userId);
    return { data: stats };
  }
}
