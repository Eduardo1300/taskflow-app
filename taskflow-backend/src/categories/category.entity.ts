import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  color: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
