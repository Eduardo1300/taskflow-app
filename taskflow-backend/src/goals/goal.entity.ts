import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  target: number;

  @Column({ nullable: true })
  current: number;

  @Column({ nullable: true })
  completed: boolean;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
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
