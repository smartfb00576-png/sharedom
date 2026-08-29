import { defineConfig } from 'vite';

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
      'sharedom/ssr': new URL('./src/ssr.ts', import.meta.url).pathname,
      'sharedom': new URL('./src/index.ts', import.meta.url).pathname,
    },
  },
});
