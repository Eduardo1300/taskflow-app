import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('email_preferences')
export class EmailPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'character varying' })
  email: string;

  @Column({ type: 'boolean', default: true })
  task_created: boolean;

  @Column({ type: 'boolean', default: true })
  task_completed: boolean;

  @Column({ type: 'boolean', default: true })
  task_reminder: boolean;

  @Column({ type: 'boolean', default: true })
  task_overdue: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
