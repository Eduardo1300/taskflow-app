import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
