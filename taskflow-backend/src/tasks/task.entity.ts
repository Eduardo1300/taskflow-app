import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  category: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  due_date: Date | null;

  @Column({ type: 'text', nullable: true })
  priority: string | null;
}
