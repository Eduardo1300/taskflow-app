import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from '../taskService';

vi.mock('../../lib/api', () => ({
  default: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    toggleTask: vi.fn(),
    deleteTask: vi.fn(),
    getTaskStats: vi.fn(),
    searchTasks: vi.fn(),
    getToken: vi.fn(() => 'mock-token'),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  },
}));

import api from '../../lib/api';

const mockApi = api as any;

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return tasks for authenticated user', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', completed: false, user_id: 'user-1' },
        { id: 2, title: 'Task 2', completed: true, user_id: 'user-1' },
      ];

      mockApi.getTasks.mockResolvedValue(mockTasks);

      const result = await TaskService.getTasks();

      expect(result.data).toEqual(mockTasks);
      expect(result.error).toBeNull();
    });

    it('should return error when API fails', async () => {
      mockApi.getTasks.mockRejectedValue(new Error('Network error'));

      const result = await TaskService.getTasks();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const newTask = { title: 'New Task', description: 'Description' };
      const createdTask = { id: 1, ...newTask, completed: false, user_id: 'user-1' };

      mockApi.createTask.mockResolvedValue(createdTask);

      const result = await TaskService.createTask(newTask as any);

      expect(result.data).toEqual(createdTask);
      expect(result.error).toBeNull();
    });

    it('should return error when API fails', async () => {
      mockApi.createTask.mockRejectedValue(new Error('Network error'));

      const result = await TaskService.createTask({ title: 'Test' } as any);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updatedTask = { id: 1, title: 'Updated Task' };

      mockApi.updateTask.mockResolvedValue(updatedTask);

      const result = await TaskService.updateTask(1, { title: 'Updated Task' });

      expect(result.data).toEqual(updatedTask);
      expect(result.error).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockApi.deleteTask.mockResolvedValue(true);

      const result = await TaskService.deleteTask(1);

      expect(result.error).toBeNull();
    });

    it('should return error when API fails', async () => {
      mockApi.deleteTask.mockRejectedValue(new Error('Network error'));

      const result = await TaskService.deleteTask(1);

      expect(result.error).toBe('Network error');
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      const stats = { total: 3, completed: 1, pending: 2 };

      mockApi.getTaskStats.mockResolvedValue(stats);

      const result = await TaskService.getTaskStats();

      expect(result.data).toEqual(stats);
      expect(result.error).toBeNull();
    });
  });

  describe('searchTasks', () => {
    it('should search tasks', async () => {
      const mockTasks = [{ id: 1, title: 'Test Task' }];

      mockApi.searchTasks.mockResolvedValue(mockTasks);

      const result = await TaskService.searchTasks('Test');

      expect(result.data).toEqual(mockTasks);
      expect(result.error).toBeNull();
    });
  });

  describe('getTasksByStatus', () => {
    it('should filter tasks by status', async () => {
      const mockTasks = [
        { id: 1, title: 'Pending Task', completed: false },
      ];

      mockApi.getTasks.mockResolvedValue(mockTasks);

      const result = await TaskService.getTasksByStatus(false);

      expect(result.data).toEqual(mockTasks);
      expect(result.error).toBeNull();
    });
  });
});
