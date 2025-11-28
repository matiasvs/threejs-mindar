import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      external: ['three', 'mindar-image-three'],
    },
  },
  server: {
    host: true,
    port: 3000,
    open: true,
  },
});
