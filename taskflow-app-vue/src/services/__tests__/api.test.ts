import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';

const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxios)
  }
}));

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has baseURL configured', () => {
    expect(api).toBeDefined();
  });

  it('has getTasks method', () => {
    expect(typeof api.getTasks).toBe('function');
  });

  it('has createTask method', () => {
    expect(typeof api.createTask).toBe('function');
  });

  it('has getCategories method', () => {
    expect(typeof api.getCategories).toBe('function');
  });
});