import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('productivity_metrics')
export class ProductivityMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'integer', default: 0 })
  tasks_created: number;

  @Column({ type: 'integer', default: 0 })
  tasks_completed: number;

  @Column({ type: 'numeric', nullable: true })
  completion_rate: number | null;

  @Column({ type: 'integer', default: 0 })
  productivity_score: number;

  @Column({ type: 'integer', nullable: true })
  overdue_tasks: number | null;

  @Column({ type: 'integer', nullable: true })
  high_priority_completed: number | null;

  @Column({ type: 'numeric', nullable: true })
  avg_completion_time_hours: number | null;

  @Column({ type: 'text', array: true, nullable: true })
  categories_used: string[] | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
