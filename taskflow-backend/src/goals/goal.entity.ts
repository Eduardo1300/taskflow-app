import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Untitled' })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  target: number;

  @Column({ nullable: true })
  current: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ default: 'general' })
  category: string;

  @Column({ default: 'daily' })
  type: string;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;
}
