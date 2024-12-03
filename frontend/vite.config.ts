import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['zustand'],
    exclude: ['lucide-react']
  },
  resolve: {
    dedupe: ['zustand']
  }
});