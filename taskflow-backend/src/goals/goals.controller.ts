import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(AuthGuard('jwt'))
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  async findAll(@Request() req) {
    const goals = await this.goalsService.findAll(req.user.userId);
    return { data: goals };
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const goal = await this.goalsService.create(body, req.user.userId);
    return { data: goal };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    const goal = await this.goalsService.update(id, body, req.user.userId);
    return { data: goal };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.goalsService.delete(id, req.user.userId);
    return { success: true };
  }
}
