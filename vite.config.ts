import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // BUNDLE SIZE (2026 audit follow-up): split large, rarely-
          // changing vendor libraries into their own chunks. This lets
          // browsers cache them separately from app code (which changes
          // far more often), and keeps `exceljs` — only needed by the
          // admin panel's Excel export — out of the chunk every regular
          // visitor downloads. AdminModal itself is also lazy-loaded
          // (see App.tsx), so this mostly benefits the admin's own
          // repeat visits plus keeps the main chunk's dependency graph
          // smaller and easier to reason about.
          manualChunks: {
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            exceljs: ['exceljs'],
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
