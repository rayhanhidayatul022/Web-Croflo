import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/live': {
        target: 'http://13.213.18.54:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/live/, '')
      },
      '/api/video': {
        target: 'http://13.213.18.54:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/video/, '/video')
      }
    }
  }
})
