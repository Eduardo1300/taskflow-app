import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskCollaborator, CollaborationInvitation, TaskActivity } from './collaboration.entities';
import { CollaborationsService } from './collaborations.service';
import { CollaborationsController } from './collaborations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskCollaborator, CollaborationInvitation, TaskActivity])],
  providers: [CollaborationsService],
  controllers: [CollaborationsController],
  exports: [CollaborationsService],
})
export class CollaborationsModule {}
