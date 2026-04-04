import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const DEFAULT_PROXY_TARGET = 'http://localhost:5000'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv reads .env* so VITE_PROXY_TARGET works (process.env alone does not in this file).
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const proxyTarget = (env.VITE_PROXY_TARGET || '').trim() || DEFAULT_PROXY_TARGET
  const isHttpsTarget = proxyTarget.startsWith('https://')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          // For https targets, verify TLS; for http (local), leave false.
          secure: isHttpsTarget,
        },
      },
    },
  }
})
