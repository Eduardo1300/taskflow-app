import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('task_collaborators')
export class TaskCollaborator {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  task_id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'character varying', nullable: true })
  permission: string | null;

  @Column({ type: 'uuid' })
  shared_by: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}

@Entity('collaboration_invitations')
export class CollaborationInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  task_id: number;

  @Column({ type: 'text' })
  invited_email: string;

  @Column({ type: 'uuid' })
  invited_by: string;

  @Column({ type: 'text', default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  permission: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  @Column({ type: 'text', nullable: true })
  message: string | null;
}

@Entity('task_activity')
export class TaskActivity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  task_id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'character varying' })
  action: string;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
