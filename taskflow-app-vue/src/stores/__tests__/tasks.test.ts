import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTaskStore } from '../tasks';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    getTasks: vi.fn(),
    getTask: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    getCategories: vi.fn(),
    getTaskStats: vi.fn()
  }
}));

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with empty tasks', () => {
    const store = useTaskStore();
    expect(store.tasks).toEqual([]);
    expect(store.loading).toBe(false);
  });

  it('fetches tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true }
    ];
    
    vi.mocked(api.getTasks).mockResolvedValue(mockTasks);
    
    const store = useTaskStore();
    await store.fetchTasks();
    
    expect(store.tasks).toHaveLength(2);
    expect(store.loading).toBe(false);
  });

  it('computes pending tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true }
    ];
    
    vi.mocked(api.getTasks).mockResolvedValue(mockTasks);
    
    const store = useTaskStore();
    await store.fetchTasks();
    
    expect(store.pendingTasks).toHaveLength(1);
    expect(store.completedTasks).toHaveLength(1);
  });
});