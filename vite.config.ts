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
      'snapdom/ssr': path.resolve(__dirname, 'src/ssr.ts'),
      'snapdom': path.resolve(__dirname, 'src/index.ts'),
      'domsnap/ssr': path.resolve(__dirname, 'src/ssr.ts'),
      'domsnap': path.resolve(__dirname, 'src/index.ts'),
    },
  },
});
