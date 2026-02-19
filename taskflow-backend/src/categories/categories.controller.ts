import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Request() req) {
    const categories = await this.categoriesService.findAll(req.user.userId);
    return { data: categories };
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const category = await this.categoriesService.create(body, req.user.userId);
    return { data: category };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    const category = await this.categoriesService.update(+id, body, req.user.userId);
    return { data: category };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.categoriesService.delete(+id);
    return { success: true };
  }
}
