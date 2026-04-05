import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  async findAll(@Request() req) {
    const integrations = await this.integrationsService.findAll(req.user.userId);
    return { data: integrations };
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const integration = await this.integrationsService.create(body, req.user.userId);
    return { data: integration };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    const integration = await this.integrationsService.update(id, body, req.user.userId);
    return { data: integration };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.integrationsService.delete(id, req.user.userId);
    return { success: true };
  }

  @Get('calendar-events')
  async getCalendarEvents(@Request() req) {
    const events = await this.integrationsService.findCalendarEvents(req.user.userId);
    return { data: events };
  }

  @Post('calendar-events')
  async createCalendarEvent(@Body() body: any, @Request() req) {
    const event = await this.integrationsService.createCalendarEvent({
      ...body,
      user_id: req.user.userId,
    });
    return { data: event };
  }

  @Get(':id/sync-history')
  async getSyncHistory(@Param('id') id: string) {
    const history = await this.integrationsService.getSyncHistory(id);
    return { data: history };
  }
}
