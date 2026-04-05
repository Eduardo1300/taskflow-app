import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('productivity_insights')
export class ProductivityInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'character varying' })
  type: string;

  @Column({ type: 'character varying' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  score: number;

  @Column({ type: 'jsonb', nullable: true })
  data: any | null;

  @Column({ type: 'boolean', default: false })
  is_dismissed: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
