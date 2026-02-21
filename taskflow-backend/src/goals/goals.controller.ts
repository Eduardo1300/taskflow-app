import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
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
    const goal = await this.goalsService.create({
      title: body.title || 'Untitled Goal',
      description: body.description || null,
      target: body.target || 1,
      current: body.current || 0,
      category: body.category || 'general',
      type: body.type || 'daily',
      completed: false,
    }, req.user.userId);
    return { data: goal };
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: any, @Request() req) {
    const goal = await this.goalsService.update(id, body, req.user.userId);
    return { data: goal };
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.goalsService.delete(id, req.user.userId);
    return { success: true };
  }
}
