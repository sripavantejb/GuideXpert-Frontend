import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // In dev, proxy /api to deployed backend by default to avoid local backend dependency.
      // Set VITE_PROXY_TARGET=http://localhost:5000 to use local backend when needed.
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        secure: process.env.VITE_PROXY_TARGET?.startsWith('https') ?? false,
      },
    },
  },
})
