import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/dyplomna/', // 🔥 ОЦЕ ГОЛОВНЕ

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    cors: true,
    proxy: {
      '/api/opendota': {
        target: 'https://api.opendota.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opendota/, ''),
      },
    },
  },

  optimizeDeps: {
    include: ['@tanstack/react-query', 'react-router-dom', 'zustand'],
  },
})
