import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: './index.html',
        viewer: './viewer.html',
        home: './home.html',
      },
      external: ['three', 'mindar-image-three', 'three/addons/controls/OrbitControls.js'],
    },
  },
  server: {
    host: true,
    port: 3000,
    open: '/home.html',
  },
});
