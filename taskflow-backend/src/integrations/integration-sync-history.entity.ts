import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('integration_sync_history')
export class IntegrationSyncHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  integration_id: string;

  @Column({ type: 'character varying' })
  integration_type: string;

  @Column({ type: 'character varying', nullable: true })
  external_id: string | null;

  @Column({ type: 'character varying' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  synced_at: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
