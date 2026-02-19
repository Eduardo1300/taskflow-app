import { Controller, Post, Res } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Response } from 'express';

@Controller('setup')
export class SetupController {
  constructor(private dataSource: DataSource) {}

  @Post('init-db')
  async initDatabase(@Res() res: Response) {
    try {
      const queries = [
        `CREATE SCHEMA IF NOT EXISTS taskflow`,
        `SET search_path TO taskflow`,
        `CREATE TABLE IF NOT EXISTS profiles (id UUID PRIMARY KEY, email VARCHAR(255) NOT NULL, full_name VARCHAR(255), created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), user_id UUID NOT NULL, category VARCHAR(100), tags TEXT[], due_date TIMESTAMP WITH TIME ZONE, priority VARCHAR(10))`,
        `CREATE TABLE IF NOT EXISTS task_comments (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE, user_id UUID NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS task_attachments (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE, user_id UUID NOT NULL, file_name TEXT NOT NULL, file_size BIGINT NOT NULL, file_type TEXT NOT NULL, file_url TEXT NOT NULL, storage_path TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS task_assignments (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE, assigned_by UUID NOT NULL, assigned_to UUID NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(task_id, assigned_to))`,
        `CREATE TABLE IF NOT EXISTS task_collaborators (id SERIAL PRIMARY KEY, task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE NOT NULL, user_id UUID NOT NULL, permission VARCHAR(20) DEFAULT 'view', shared_by UUID NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(task_id, user_id))`,
        `CREATE TABLE IF NOT EXISTS collaboration_invitations (id SERIAL PRIMARY KEY, task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE NOT NULL, invited_email VARCHAR(255) NOT NULL, invited_by UUID NOT NULL, permission VARCHAR(20) DEFAULT 'view', status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'))`,
        `CREATE TABLE IF NOT EXISTS task_activity (id SERIAL PRIMARY KEY, task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE NOT NULL, user_id UUID NOT NULL, action VARCHAR(50) NOT NULL, details JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS notifications (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'info', read BOOLEAN DEFAULT FALSE, data JSONB DEFAULT '{}', created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS integrations (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID NOT NULL, type VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, config JSONB NOT NULL DEFAULT '{}', is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), last_sync_at TIMESTAMP WITH TIME ZONE)`,
        `CREATE TABLE IF NOT EXISTS productivity_metrics (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID NOT NULL, date DATE NOT NULL, tasks_created INTEGER DEFAULT 0, tasks_completed INTEGER DEFAULT 0, completion_rate DECIMAL(5,2) DEFAULT 0, productivity_score INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(user_id, date))`,
        `CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`,
      ];

      for (const query of queries) {
        await this.dataSource.query(query);
      }

      return res.json({ success: true, message: 'Database initialized successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
