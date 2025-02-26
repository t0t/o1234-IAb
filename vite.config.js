// vite.config.js
export default {
  root: '.',
  publicDir: 'public',
  base: '/',
  server: {
    host: true,
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: true,
    sourcemap: true
  },
  preview: {
    port: 5000
  }
}
