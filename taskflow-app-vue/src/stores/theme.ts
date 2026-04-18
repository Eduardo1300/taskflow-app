import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false);

  function init() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      isDark.value = true;
      document.documentElement.classList.add('dark');
    } else if (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDark.value = true;
      document.documentElement.classList.add('dark');
    }
  }

  function toggle() {
    isDark.value = !isDark.value;
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  function setDark(value: boolean) {
    isDark.value = value;
    if (value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  init();

  return {
    isDark,
    toggle,
    setDark,
    init
  };
});