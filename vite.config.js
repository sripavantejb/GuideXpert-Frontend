import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // In dev, proxy /api to local backend by default so /api/college-predictor etc. work locally.
      // Set VITE_PROXY_TARGET=https://guide-xpert-backend.vercel.app to use deployed backend instead.
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        secure: process.env.VITE_PROXY_TARGET?.startsWith('https') ?? false,
      },
    },
  },
})
