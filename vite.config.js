import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // In dev, proxy /api to the deployed backend (override with VITE_API_URL for local backend)
      '/api': {
        target: 'https://guide-xpert-backend.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
