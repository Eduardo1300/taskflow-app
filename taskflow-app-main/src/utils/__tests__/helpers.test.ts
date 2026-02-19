import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getInitials,
  truncateText,
  capitalizeFirst,
  generateId,
  debounce,
  getStatusColor,
  getPriorityColor,
  priorityColors,
  priorityLabels,
  taskStatusLabels,
} from '../helpers';

describe('helpers', () => {
  describe('formatDate', () => {
    it('should format a valid date string', () => {
      expect(formatDate('2024-01-15')).toBe('15 ene 2024');
    });

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('should format a valid date with time', () => {
      expect(formatDateTime('2024-01-15T10:30:00')).toContain('10:30');
    });

    it('should return empty string for null', () => {
      expect(formatDateTime(null)).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return relative time for recent dates', () => {
      const recentDate = new Date();
      recentDate.setMinutes(recentDate.getMinutes() - 5);
      expect(formatRelativeTime(recentDate.toISOString())).toContain('hace');
    });

    it('should return empty string for null', () => {
      expect(formatRelativeTime(null)).toBe('');
    });
  });

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should handle multiple names', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('should return empty string for empty name', () => {
      expect(getInitials('')).toBe('');
    });

    it('should return empty string for null', () => {
      expect(getInitials(null as any)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate long text', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
    });

    it('should handle empty text', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
    });

    it('should lowercase the rest', () => {
      expect(capitalizeFirst('HELLO')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('');
    });
  });

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should have length greater than 10', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(10);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should delay function execution', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should call function with latest arguments', () => {
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc('first');
      vi.advanceTimersByTime(50);
      debouncedFunc('second');

      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledWith('second');
    });
  });

  describe('priorityColors', () => {
    it('should have colors for all priorities', () => {
      expect(priorityColors.high).toBe('bg-red-500');
      expect(priorityColors.medium).toBe('bg-yellow-500');
      expect(priorityColors.low).toBe('bg-green-500');
    });
  });

  describe('priorityLabels', () => {
    it('should have labels for all priorities', () => {
      expect(priorityLabels.high).toBe('Alta');
      expect(priorityLabels.medium).toBe('Media');
      expect(priorityLabels.low).toBe('Baja');
    });
  });

  describe('taskStatusLabels', () => {
    it('should have labels for all statuses', () => {
      expect(taskStatusLabels.pending).toBe('Pendiente');
      expect(taskStatusLabels.in_progress).toBe('En progreso');
      expect(taskStatusLabels.completed).toBe('Completada');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for completed', () => {
      expect(getStatusColor('completed')).toContain('green');
    });

    it('should return correct color for in_progress', () => {
      expect(getStatusColor('in_progress')).toContain('blue');
    });

    it('should return correct color for pending', () => {
      expect(getStatusColor('pending')).toContain('gray');
    });
  });

  describe('getPriorityColor', () => {
    it('should return correct color for high', () => {
      expect(getPriorityColor('high')).toContain('red');
    });

    it('should return correct color for medium', () => {
      expect(getPriorityColor('medium')).toContain('yellow');
    });

    it('should return correct color for low', () => {
      expect(getPriorityColor('low')).toContain('green');
    });

    it('should return gray for unknown priority', () => {
      expect(getPriorityColor('unknown')).toContain('gray');
    });
  });
});
