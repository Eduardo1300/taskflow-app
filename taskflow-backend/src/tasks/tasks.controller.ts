import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(@Request() req) {
    const tasks = await this.tasksService.findAll(req.user.userId);
    return { data: tasks };
  }

  @Get('stats')
  async getStats(@Request() req) {
    const stats = await this.tasksService.getStats(req.user.userId);
    return { data: stats };
  }

  @Get('search')
  async search(@Query('q') query: string, @Request() req) {
    const tasks = await this.tasksService.search(query, req.user.userId);
    return { data: tasks };
  }

  @Get('status/:completed')
  async findByStatus(@Param('completed') completed: string, @Request() req) {
    const tasks = await this.tasksService.findByStatus(completed === 'true', req.user.userId);
    return { data: tasks };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const task = await this.tasksService.findOne(+id, req.user.userId);
    return { data: task };
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const task = await this.tasksService.create(body, req.user.userId);
    return { data: task };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    const task = await this.tasksService.update(+id, body, req.user.userId);
    return { data: task };
  }

  @Put(':id/toggle')
  async toggle(@Param('id') id: string, @Request() req) {
    const task = await this.tasksService.toggleComplete(+id, req.user.userId);
    return { data: task };
  }

  @Put(':id/favorite')
  async toggleFavorite(@Param('id') id: string, @Request() req) {
    const task = await this.tasksService.toggleFavorite(+id, req.user.userId);
    return { data: task };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.tasksService.delete(+id, req.user.userId);
    return { success: true };
  }
}
