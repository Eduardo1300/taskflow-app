import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AutomationService } from './automation.service';

@Controller('automation')
@UseGuards(AuthGuard('jwt'))
export class AutomationController {
  constructor(private automationService: AutomationService) {}

  @Get()
  async findAll(@Request() req) {
    const rules = await this.automationService.findAll(req.user.userId);
    return { data: rules };
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const rule = await this.automationService.create({
      ...body,
      user_id: req.user.userId,
    });
    return { data: rule };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    const rule = await this.automationService.update(id, req.user.userId, body);
    return { data: rule };
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string, @Request() req) {
    const rule = await this.automationService.toggle(id, req.user.userId);
    return { data: rule };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.automationService.delete(id, req.user.userId);
    return { success: true };
  }

  @Post(':id/execute')
  async execute(@Param('id') id: string, @Body() body: any, @Request() req) {
    const result = await this.automationService.execute(id, req.user.userId, body);
    return { data: result };
  }
}
