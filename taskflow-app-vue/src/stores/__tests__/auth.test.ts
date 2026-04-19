import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    getToken: vi.fn(),
    clearToken: vi.fn()
  }
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes as not authenticated', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBe(null);
  });

  it('has error initially null', () => {
    const store = useAuthStore();
    expect(store.error).toBe(null);
  });

  it('has loading initially false', () => {
    const store = useAuthStore();
    expect(store.loading).toBe(false);
  });
});