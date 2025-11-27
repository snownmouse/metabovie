import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure relative paths for assets so it works in subfolders or without a root domain
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    host: true // Listen on all local IPs
  }
});