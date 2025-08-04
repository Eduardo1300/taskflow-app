// Re-exportar tipos de la base de datos
export type { Task, TaskInsert, TaskUpdate, Profile } from './database';

// Tipos locales para compatibilidad
export interface User {
  id: string;
  name: string;
  email: string;
}

// Tipo extendido para tareas con formato de fecha local
export interface TaskWithDate {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: Date;
  user_id: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}