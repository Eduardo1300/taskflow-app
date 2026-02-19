import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
@UseGuards(AuthGuard('jwt'))
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Get()
  async findAll(@Request() req) {
    const webhooks = await this.webhooksService.findAll(req.user.userId);
    return { data: webhooks };
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const webhook = await this.webhooksService.create(body, req.user.userId);
    return { data: webhook };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.webhooksService.delete(id, req.user.userId);
    return { success: true };
  }
}
