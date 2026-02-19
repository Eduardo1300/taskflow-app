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
}
