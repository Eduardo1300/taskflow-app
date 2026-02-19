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
}
