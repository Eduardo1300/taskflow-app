import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Patch, Headers, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiService } from './api.service';

@Controller('api-keys')
@UseGuards(AuthGuard('jwt'))
export class ApiController {
  constructor(private apiService: ApiService) {}

  @Get()
  async findAll(@Request() req) {
    const keys = await this.apiService.findAllKeys(req.user.userId);
    return { data: keys };
  }

  @Post()
  async create(@Body() body: { name: string; permissions: string[]; rate_limit?: number }, @Request() req) {
    const key = await this.apiService.createKey({
      ...body,
      user_id: req.user.userId,
    });
    return { data: key };
  }

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string, @Request() req) {
    const key = await this.apiService.toggleKey(id, req.user.userId);
    return { data: key };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.apiService.deleteKey(id, req.user.userId);
    return { success: true };
  }

  @Post('validate')
  @HttpCode(200)
  async validate(@Headers('x-api-key') apiKey: string) {
    const key = await this.apiService.validateKey(apiKey);
    return { valid: !!key, key: key ? { id: key.id, name: key.name, permissions: key.permissions } : null };
  }
}
