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
        `CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), user_id UUID NOT NULL, category TEXT, tags TEXT[], due_date TIMESTAMP WITH TIME ZONE, priority TEXT, ai_priority_suggestion TEXT, ai_category_suggestion TEXT, ai_due_date_suggestion TIMESTAMP WITH TIME ZONE, calendar_event_id TEXT)`,
        `CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name TEXT NOT NULL, color TEXT, user_id UUID NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS goals (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, target_date DATE, progress INTEGER DEFAULT 0, status TEXT DEFAULT 'active', created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`,
        `CREATE TABLE IF NOT EXISTS notifications (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, type TEXT DEFAULT 'info', read BOOLEAN DEFAULT FALSE, data JSONB DEFAULT '{}', created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`,
        `CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)`,
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
