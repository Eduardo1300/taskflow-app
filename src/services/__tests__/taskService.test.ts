import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from '../taskService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return tasks for authenticated user', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: true },
      ];

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
      });

      const result = await TaskService.getTasks();

      expect(result.data).toEqual(mockTasks);
      expect(result.error).toBeNull();
    });

    it('should return error when user not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await TaskService.getTasks();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Usuario no autenticado');
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const newTask = { title: 'New Task', description: 'Description' };
      const createdTask = { id: 1, ...newTask, completed: false, user_id: 'user-1' };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdTask, error: null }),
      });

      const result = await TaskService.createTask(newTask as any);

      expect(result.data).toEqual(createdTask);
      expect(result.error).toBeNull();
    });

    it('should return error when user not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await TaskService.createTask({ title: 'Test' } as any);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Usuario no autenticado');
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updatedTask = { id: 1, title: 'Updated Task' };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedTask, error: null }),
      });

      const result = await TaskService.updateTask(1, { title: 'Updated Task' });

      expect(result.data).toEqual(updatedTask);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await TaskService.deleteTask(1);

      expect(result.error).toBeNull();
    });

    it('should return error when user not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      const result = await TaskService.deleteTask(1);

      expect(result.error).toBe('Usuario no autenticado');
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle task completion', async () => {
      const toggledTask = { id: 1, title: 'Task', completed: true };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: toggledTask, error: null }),
      });

      const result = await TaskService.toggleTaskCompletion(1, true);

      expect(result.data).toEqual(toggledTask);
      expect(result.error).toBeNull();
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [
            { completed: false },
            { completed: true },
            { completed: false },
          ],
          error: null,
        }),
      });

      const result = await TaskService.getTaskStats();

      expect(result.data).toEqual({ total: 3, completed: 1, pending: 2 });
      expect(result.error).toBeNull();
    });
  });

  describe('searchTasks', () => {
    it('should search tasks', async () => {
      const mockTasks = [{ id: 1, title: 'Test Task' }];

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
      });

      const result = await TaskService.searchTasks('Test');

      expect(result.data).toEqual(mockTasks);
      expect(result.error).toBeNull();
    });
  });

  describe('getTasksByStatus', () => {
    it('should filter tasks by status', async () => {
      const mockTasks = [{ id: 1, title: 'Pending Task', completed: false }];

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-1' } },
      });

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
      });

      const result = await TaskService.getTasksByStatus(false);

      expect(result.data).toEqual(mockTasks);
      expect(result.error).toBeNull();
    });
  });
});
