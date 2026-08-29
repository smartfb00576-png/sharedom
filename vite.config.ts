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
      'snapdom/ssr': new URL('./src/ssr.ts', import.meta.url).pathname,
      'snapdom': new URL('./src/index.ts', import.meta.url).pathname,
      'domsnap/ssr': new URL('./src/ssr.ts', import.meta.url).pathname,
      'domsnap': new URL('./src/index.ts', import.meta.url).pathname,
    },
  },
});
