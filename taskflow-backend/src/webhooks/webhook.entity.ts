import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'character varying' })
  url: string;

  @Column({ type: 'text', array: true })
  events: string[];

  @Column({ type: 'character varying' })
  secret: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
