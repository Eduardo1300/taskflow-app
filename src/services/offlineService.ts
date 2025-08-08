import { Task } from '../types';
import { TaskService } from './taskService';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'toggle';
  data: any;
  timestamp: number;
  taskId?: number;
}

interface CachedTask extends Task {
  _cached: boolean;
  _lastSync: number;
}

class OfflineService {
  private readonly CACHE_KEY = 'taskflow_offline_cache';
  private readonly ACTIONS_KEY = 'taskflow_offline_actions';
  private readonly LAST_SYNC_KEY = 'taskflow_last_sync';
  
  // Cache management
  getCachedTasks(): CachedTask[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  setCachedTasks(tasks: Task[]): void {
    try {
      const cachedTasks: CachedTask[] = tasks.map(task => ({
        ...task,
        _cached: true,
        _lastSync: Date.now()
      }));
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedTasks));
      this.setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Error caching tasks:', error);
    }
  }

  // Offline actions queue
  private getOfflineActions(): OfflineAction[] {
    try {
      const actions = localStorage.getItem(this.ACTIONS_KEY);
      return actions ? JSON.parse(actions) : [];
    } catch {
      return [];
    }
  }

  private addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): void {
    try {
      const actions = this.getOfflineActions();
      const newAction: OfflineAction = {
        ...action,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };
      actions.push(newAction);
      localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('Error adding offline action:', error);
    }
  }

  private clearOfflineActions(): void {
    localStorage.removeItem(this.ACTIONS_KEY);
  }

  // Network status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Offline operations
  createTaskOffline(taskData: Partial<Task>): CachedTask {
    const tempId = Date.now(); // Temporary ID for offline tasks
    const task: CachedTask = {
      id: tempId,
      title: taskData.title || '',
      description: taskData.description || null,
      completed: taskData.completed || false,
      category: taskData.category || null,
      tags: taskData.tags || [],
      due_date: taskData.due_date || null,
      priority: taskData.priority || 'medium',
      user_id: '', // Will be set when syncing
      created_at: new Date().toISOString(),
      _cached: true,
      _lastSync: 0 // Not synced yet
    };

    // Add to cache
    const cachedTasks = this.getCachedTasks();
    cachedTasks.unshift(task);
    this.setCachedTasksWithoutSync(cachedTasks);

    // Add to offline actions
    this.addOfflineAction({
      type: 'create',
      data: taskData,
      taskId: tempId
    });

    return task;
  }

  updateTaskOffline(taskId: number, taskData: Partial<Task>): void {
    const cachedTasks = this.getCachedTasks();
    const taskIndex = cachedTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      cachedTasks[taskIndex] = {
        ...cachedTasks[taskIndex],
        ...taskData,
        _lastSync: 0 // Mark as needing sync
      };
      this.setCachedTasksWithoutSync(cachedTasks);
    }

    this.addOfflineAction({
      type: 'update',
      data: taskData,
      taskId
    });
  }

  deleteTaskOffline(taskId: number): void {
    const cachedTasks = this.getCachedTasks();
    const updatedTasks = cachedTasks.filter(t => t.id !== taskId);
    this.setCachedTasksWithoutSync(updatedTasks);

    this.addOfflineAction({
      type: 'delete',
      data: {},
      taskId
    });
  }

  toggleTaskOffline(taskId: number, completed: boolean): void {
    const cachedTasks = this.getCachedTasks();
    const taskIndex = cachedTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      cachedTasks[taskIndex] = {
        ...cachedTasks[taskIndex],
        completed,
        _lastSync: 0
      };
      this.setCachedTasksWithoutSync(cachedTasks);
    }

    this.addOfflineAction({
      type: 'toggle',
      data: { completed },
      taskId
    });
  }

  // Sync operations
  async syncWithServer(): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    if (!this.isOnline()) {
      return { success: false, syncedCount: 0, errors: ['No hay conexión a internet'] };
    }

    const actions = this.getOfflineActions();
    const errors: string[] = [];
    let syncedCount = 0;

    // Execute offline actions
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'create':
            await TaskService.createTask(action.data);
            break;
          case 'update':
            if (action.taskId) {
              await TaskService.updateTask(action.taskId, action.data);
            }
            break;
          case 'delete':
            if (action.taskId) {
              await TaskService.deleteTask(action.taskId);
            }
            break;
          case 'toggle':
            if (action.taskId) {
              await TaskService.toggleTaskCompletion(action.taskId, action.data.completed);
            }
            break;
        }
        syncedCount++;
      } catch (error) {
        console.error('Error syncing action:', action, error);
        errors.push(`Error sincronizando ${action.type}: ${error}`);
      }
    }

    if (errors.length === 0) {
      // Clear offline actions if all synced successfully
      this.clearOfflineActions();
      
      // Refresh cache with server data
      const { data: serverTasks } = await TaskService.getTasks();
      if (serverTasks) {
        this.setCachedTasks(serverTasks);
      }
    }

    return {
      success: errors.length === 0,
      syncedCount,
      errors
    };
  }

  // Utility methods
  private setCachedTasksWithoutSync(tasks: CachedTask[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error caching tasks:', error);
    }
  }

  getLastSyncTime(): number {
    try {
      const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
      return lastSync ? parseInt(lastSync) : 0;
    } catch {
      return 0;
    }
  }

  private setLastSyncTime(timestamp: number): void {
    localStorage.setItem(this.LAST_SYNC_KEY, timestamp.toString());
  }

  getPendingActionsCount(): number {
    return this.getOfflineActions().length;
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.ACTIONS_KEY);
    localStorage.removeItem(this.LAST_SYNC_KEY);
  }

  // Auto-sync when connection returns
  setupAutoSync(callback?: () => void): void {
    window.addEventListener('online', async () => {
      console.log('Conexión restaurada, iniciando sincronización...');
      const result = await this.syncWithServer();
      if (result.success && callback) {
        callback();
      }
    });

    window.addEventListener('offline', () => {
      console.log('Conexión perdida, activando modo offline...');
    });
  }
}

export const offlineService = new OfflineService();
