import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true, // 允许局域网访问前端
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:23335',
        changeOrigin: true,
      },
    },
  },
});
