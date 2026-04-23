import { defineConfig } from 'vite';

export default defineConfig({
  base: '/TheBaseDemo/dist/',
  root: '.',
  publicDir: false,
  server: {
    open: true,
    port: 5174,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
