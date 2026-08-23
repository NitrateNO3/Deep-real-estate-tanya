import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    /* Dev only. In production the app and its /api functions are one origin on
       Vercel; locally the API runs as a separate Node process (npm run dev:local
       at the repo root starts both), so forward /api to it. Ignored by the
       build. */
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
});
