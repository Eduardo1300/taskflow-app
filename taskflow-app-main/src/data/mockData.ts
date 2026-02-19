import { Task, User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@example.com',
  },
];

export const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Completar proyecto React',
    description: 'Finalizar la aplicación TaskFlow con todas las funcionalidades',
    completed: false,
    created_at: '2024-01-15T10:00:00.000Z',
    user_id: '1',
    category: 'Trabajo',
    tags: ['react', 'typescript', 'frontend'],
    due_date: '2024-01-20T23:59:59.000Z',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Revisar código',
    description: 'Hacer code review del pull request #123',
    completed: true,
    created_at: '2024-01-14T10:00:00.000Z',
    user_id: '1',
    category: 'Trabajo',
    tags: ['review', 'codigo'],
    due_date: null,
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Preparar presentación',
    description: 'Crear slides para la reunión del equipo',
    completed: false,
    created_at: '2024-01-16T10:00:00.000Z',
    user_id: '1',
    category: 'Personal',
    tags: ['presentacion', 'equipo'],
    due_date: '2024-01-18T14:00:00.000Z',
    priority: 'medium'
  },
  {
    id: 4,
    title: 'Actualizar documentación',
    description: 'Documentar las nuevas APIs desarrolladas',
    completed: false,
    created_at: '2024-01-13T10:00:00.000Z',
    user_id: '1',
    category: 'Trabajo',
    tags: ['documentacion', 'api'],
    due_date: null,
    priority: 'low'
  },
];