import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('api_rate_limits')
export class ApiRateLimit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  api_key_id: string;

  @Column({ type: 'integer', default: 0 })
  requests_count: number;

  @Column({ type: 'timestamp with time zone' })
  window_start: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
