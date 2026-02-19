import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CollaborationsService } from './collaborations.service';

@Controller('collaborations')
@UseGuards(AuthGuard('jwt'))
export class CollaborationsController {
  constructor(private collaborationsService: CollaborationsService) {}

  @Post('invite')
  async invite(@Body() body: { taskId: number; email: string; permission: string }, @Request() req) {
    const invitation = await this.collaborationsService.inviteCollaborator(body.taskId, body.email, body.permission, req.user.userId);
    return { data: invitation };
  }

  @Get('task/:taskId/collaborators')
  async getCollaborators(@Param('taskId') taskId: string) {
    const collaborators = await this.collaborationsService.getCollaborators(+taskId);
    return { data: collaborators };
  }

  @Delete('task/:taskId/collaborator/:userId')
  async removeCollaborator(@Param('taskId') taskId: string, @Param('userId') userId: string) {
    await this.collaborationsService.removeCollaborator(+taskId, userId);
    return { success: true };
  }

  @Get('task/:taskId/activity')
  async getActivity(@Param('taskId') taskId: string) {
    const activity = await this.collaborationsService.getTaskActivity(+taskId);
    return { data: activity };
  }
}
