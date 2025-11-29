import { defineConfig } from 'vite';

export default defineConfig({
  base: '/threejs-mindar/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: './index.html',
        ar: './ar.html',
        viewer: './viewer.html',
      },
      external: ['three', 'mindar-image-three', 'three/addons/controls/OrbitControls.js', 'three/addons/loaders/GLTFLoader.js'],
    },
  },
  server: {
    host: true,
    port: 3000,
    open: './index.html',
  },
});
