import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Dev server proxies /api to the FastAPI backend so the browser sees same-origin
// requests (cookies work without extra CORS/SameSite fuss). In production this
// frontend is built to static files and can be served by FastAPI itself, or by
// any static host placed behind the same reverse proxy as the API.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
