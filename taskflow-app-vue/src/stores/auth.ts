import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value || !!api.getToken());
  const userEmail = computed(() => user.value?.email || '');

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      await api.login(email, password);
      await fetchProfile();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Error al iniciar sesión';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string, fullName?: string) {
    loading.value = true;
    error.value = null;
    try {
      await api.register(email, password, fullName);
      await fetchProfile();
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Error al registrar';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile() {
    if (!api.getToken()) return;
    loading.value = true;
    try {
      user.value = await api.getProfile();
    } catch {
      user.value = null;
      api.clearToken();
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    await api.logout();
    user.value = null;
  }

  function init() {
    if (api.getToken()) {
      fetchProfile();
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userEmail,
    login,
    register,
    fetchProfile,
    logout,
    init
  };
});