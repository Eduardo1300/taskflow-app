import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ nullable: true })
  due_date: Date;

  @Column({ nullable: true })
  priority: string;

  @Column({ default: false })
  favorite: boolean;

  @Column({ nullable: true })
  ai_priority_suggestion: string;

  @Column({ nullable: true })
  ai_category_suggestion: string;

  @Column({ nullable: true })
  ai_due_date_suggestion: Date;

  @Column({ nullable: true })
  calendar_event_id: string;
}
