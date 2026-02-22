import { Controller, Post, Res } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Response } from 'express';
import * as crypto from 'crypto';

@Controller('setup')
export class SetupController {
  constructor(private dataSource: DataSource) {}

  @Post('init-db')
  async initDatabase(@Res() res: Response) {
    try {
      const queries = [
        `DROP TABLE IF EXISTS profiles CASCADE`,
        `CREATE TABLE profiles (id UUID PRIMARY KEY, email VARCHAR(255) NOT NULL, full_name VARCHAR(255), phone TEXT, location TEXT, bio TEXT, avatar TEXT, timezone TEXT, language TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`,
        
        `DROP TABLE IF EXISTS tasks CASCADE`,
        `CREATE TABLE tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, completed BOOLEAN DEFAULT FALSE, favorite BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW(), user_id UUID NOT NULL, category VARCHAR(100), tags TEXT, due_date TIMESTAMP, priority VARCHAR(20))`,
        
        `DROP TABLE IF EXISTS categories CASCADE`,
        `CREATE TABLE categories (id SERIAL PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL, user_id UUID, created_at TIMESTAMP DEFAULT NOW())`,
        
        `DROP TABLE IF EXISTS goals CASCADE`,
        `CREATE TABLE goals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT, description TEXT, target INTEGER, current INTEGER, completed BOOLEAN DEFAULT FALSE, category TEXT, type TEXT, user_id UUID NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(), start_date TIMESTAMP, end_date TIMESTAMP)`,
        
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

  @Post('seed-admin')
  async seedAdmin(@Res() res: Response) {
    try {
      const adminEmail = 'admin@taskflow.com';
      
      const existing = await this.dataSource.query(
        'SELECT id FROM profiles WHERE email = $1',
        [adminEmail]
      );

      if (existing.length > 0) {
        return res.json({ success: true, message: 'Admin user already exists', email: adminEmail });
      }

      const adminId = crypto.randomUUID();
      await this.dataSource.query(
        'INSERT INTO profiles (id, email, full_name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [adminId, adminEmail, 'Admin']
      );

      await this.dataSource.query(
        `INSERT INTO tasks (title, description, completed, favorite, created_at, user_id, category, priority) VALUES 
        ('Bienvenido a TaskFlow', 'Esta es tu primera tarea. ¡Organiza tu vida productiva!', false, true, NOW(), $1, 'general', 'medium'),
        ('Explora el dashboard', 'Revisa todas las funcionalidades disponibles', false, false, NOW(), $1, 'general', 'low'),
        ('Crea tu primera tarea', 'Usa el botón + para agregar nuevas tareas', false, false, NOW(), $1, 'general', 'high')`,
        [adminId]
      );

      return res.json({ 
        success: true, 
        message: 'Admin user created successfully',
        email: adminEmail,
        password: 'admin123'
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
