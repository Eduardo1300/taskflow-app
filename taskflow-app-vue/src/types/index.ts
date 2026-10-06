export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  category?: string;
  categoryId?: number;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  dueDate?: string;
  tags?: string[];
  favorite?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  color?: string;
  userId?: string;
  createdAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;
  completed: boolean;
  userId?: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  userId?: string;
  createdAt?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
}

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}