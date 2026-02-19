import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  target: number;

  @Column({ type: 'int', nullable: true })
  current: number | null;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'character varying' })
  category: string;

  @Column({ type: 'character varying' })
  type: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone' })
  updated_at: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  start_date: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  end_date: Date | null;
}
