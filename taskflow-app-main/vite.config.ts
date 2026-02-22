import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TaskFlow',
        short_name: 'TaskFlow',
        description: 'A modern task management application',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png.b64',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png.b64',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
})
