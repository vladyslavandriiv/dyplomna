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
      '/api/free-llm': {
        target: 'https://apifreellm.com/api/v1/chat',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/free-llm/, ''),
      },
      '/api/nvidia': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
      },
    },
  },

  optimizeDeps: {
    include: ['@tanstack/react-query', 'react-router-dom', 'zustand'],
  },
})
