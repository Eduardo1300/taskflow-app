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
        
        `DROP TABLE IF EXISTS profiles CASCADE`,
        `CREATE TABLE profiles (id UUID PRIMARY KEY, email VARCHAR(255) NOT NULL, full_name VARCHAR(255), created_at TIMESTAMP DEFAULT NOW())`,
        
        `DROP TABLE IF EXISTS tasks CASCADE`,
        `CREATE TABLE tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW(), user_id UUID NOT NULL, category VARCHAR(100), tags TEXT, due_date TIMESTAMP, priority VARCHAR(20))`,
        
        `DROP TABLE IF EXISTS categories CASCADE`,
        `CREATE TABLE categories (id SERIAL PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL, user_id UUID, created_at TIMESTAMP DEFAULT NOW())`,
        
`DROP TABLE IF EXISTS goals CASCADE`,
        `CREATE TABLE goals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT DEFAULT 'Untitled', description TEXT, target INTEGER DEFAULT 1, current INTEGER, completed BOOLEAN DEFAULT FALSE, category TEXT DEFAULT 'general', type TEXT DEFAULT 'daily', user_id UUID NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(), start_date TIMESTAMP, end_date TIMESTAMP)`,
        
        `DROP TABLE IF EXISTS notifications CASCADE`,
        `CREATE TABLE notifications (id UUID PRIMARY KEY, title TEXT NOT NULL, message TEXT NOT NULL, type TEXT DEFAULT 'info', read BOOLEAN DEFAULT FALSE, user_id UUID NOT NULL, data JSONB, created_at TIMESTAMP DEFAULT NOW())`,
        
        `CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`,
      ];

      for (const query of queries) {
        await this.dataSource.query(query);
      }

      return res.json({ success: true, message: 'Database initialized successfully with all tables' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
