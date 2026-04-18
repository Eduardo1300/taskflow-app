<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(() => {
  authStore.init();
});
</script>

<template>
  <div class="min-h-screen">
    <router-view />
  </div>
</template>