import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskCollaborator, CollaborationInvitation, TaskActivity } from './collaboration.entities';

@Injectable()
export class CollaborationsService {
  constructor(
    @InjectRepository(TaskCollaborator)
    private collaboratorRepo: Repository<TaskCollaborator>,
    @InjectRepository(CollaborationInvitation)
    private invitationRepo: Repository<CollaborationInvitation>,
    @InjectRepository(TaskActivity)
    private activityRepo: Repository<TaskActivity>,
  ) {}

  async inviteCollaborator(taskId: number, email: string, permission: string, userId: string) {
    const invitation = this.invitationRepo.create({
      task_id: taskId,
      invited_email: email,
      invited_by: userId,
      permission,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return this.invitationRepo.save(invitation);
  }

  async getCollaborators(taskId: number) {
    return this.collaboratorRepo.find({ where: { task_id: taskId } });
  }

  async removeCollaborator(taskId: number, userId: string) {
    return this.collaboratorRepo.delete({ task_id: taskId, user_id: userId });
  }

  async getTaskActivity(taskId: number) {
    return this.activityRepo.find({ where: { task_id: taskId }, order: { created_at: 'DESC' }, take: 50 });
  }

  async logActivity(taskId: number, userId: string, action: string, details?: any) {
    const activity = this.activityRepo.create({ task_id: taskId, user_id: userId, action, details: JSON.stringify(details) });
    return this.activityRepo.save(activity);
  }
}
