import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    host: true,
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['three', 'mind-ar/dist/mindar-image-three.prod.js'],
  },
});
