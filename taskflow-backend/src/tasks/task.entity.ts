import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  created_at: Date;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  tags: string;

  @Column({ nullable: true })
  due_date: Date;

  @Column({ nullable: true })
  priority: string;

  @Column({ default: false })
  favorite: boolean;
}
