import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'bigint', nullable: true })
  task_id: number | null;

  @Column({ type: 'uuid', nullable: true })
  integration_id: string | null;

  @Column({ type: 'character varying' })
  external_event_id: string;

  @Column({ type: 'jsonb' })
  event_data: any;

  @Column({ type: 'character varying', nullable: true })
  sync_status: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
