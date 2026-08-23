import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Separate from vite.config.ts on purpose: vite.config.ts pulls in the
// @tailwindcss/vite plugin, which isn't needed (and adds startup cost) for
// running unit tests. Path aliases and the React plugin are duplicated
// here to keep both configs simple and independent.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**', 'src/lib/**'],
    },
  },
});
