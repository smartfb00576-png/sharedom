import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'preview',
  base: './',
  build: {
    outDir: '../dist-preview',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      'domsnap/ssr': path.resolve(__dirname, 'src/ssr.ts'),
      'domsnap': path.resolve(__dirname, 'src/index.ts'),
      '@domsnap/core/ssr': path.resolve(__dirname, 'src/ssr.ts'),
      '@domsnap/core': path.resolve(__dirname, 'src/index.ts'),
    },
  },
});
