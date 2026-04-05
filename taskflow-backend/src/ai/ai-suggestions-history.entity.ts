import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('ai_suggestions_history')
export class AiSuggestionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'bigint', nullable: true })
  task_id: number | null;

  @Column({ type: 'character varying' })
  suggestion_type: string;

  @Column({ type: 'text' })
  suggested_value: string;

  @Column({ type: 'numeric' })
  confidence: number;

  @Column({ type: 'boolean', nullable: true })
  was_applied: boolean | null;

  @Column({ type: 'character varying', nullable: true })
  feedback: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
