import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@Controller('ai-suggestions')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private aiService: AiService) {}

  @Get()
  async findAll(@Request() req) {
    const suggestions = await this.aiService.findAll(req.user.userId);
    return { data: suggestions };
  }

  @Post()
  async create(@Body() body: any, @Request() req) {
    const suggestion = await this.aiService.create({
      ...body,
      user_id: req.user.userId,
    });
    return { data: suggestion };
  }

  @Post(':id/feedback')
  async updateFeedback(
    @Param('id') id: string,
    @Body() body: { feedback: string; was_applied: boolean },
  ) {
    const suggestion = await this.aiService.updateFeedback(
      id,
      body.feedback,
      body.was_applied,
    );
    return { data: suggestion };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.aiService.delete(id);
    return { success: true };
  }
}
