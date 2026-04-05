import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Request() req) {
    const notifications = await this.notificationsService.findAll(req.user.userId);
    return { data: notifications };
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const notification = await this.notificationsService.create(body, req.user.userId);
    return { data: notification };
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    await this.notificationsService.markAsRead(id, req.user.userId);
    return { success: true };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.notificationsService.delete(id, req.user.userId);
    return { success: true };
  }

  @Get('configs')
  async getConfigs(@Request() req) {
    const configs = await this.notificationsService.getConfigs(req.user.userId);
    return { data: configs };
  }

  @Post('configs')
  async createConfig(@Body() body: any, @Request() req) {
    const config = await this.notificationsService.createConfig(body, req.user.userId);
    return { data: config };
  }

  @Get('email-preferences')
  async getEmailPreferences(@Request() req) {
    const prefs = await this.notificationsService.getEmailPreferences(req.user.userId);
    return { data: prefs };
  }

  @Post('email-preferences')
  async createEmailPreference(@Body() body: any, @Request() req) {
    const pref = await this.notificationsService.createEmailPreference({
      ...body,
      user_id: req.user.userId,
    });
    return { data: pref };
  }

  @Put('email-preferences/:id')
  async updateEmailPreference(@Param('id') id: string, @Body() body: any) {
    const pref = await this.notificationsService.updateEmailPreference(id, body);
    return { data: pref };
  }
}
