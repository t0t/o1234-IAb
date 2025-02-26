// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: '/o1234-IAb/',  // Nombre del repositorio para GitHub Pages
  server: {
    host: true,
    port: 3000,
    open: true
  },
  build: {
    outDir: '.', // Genera los archivos en la raíz
    emptyOutDir: false, // Evita que borre archivos existentes en la raíz
    assetsDir: 'assets',
    minify: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  preview: {
    port: 5000
  }
});
