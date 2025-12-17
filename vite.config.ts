import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Define caminhos relativos para os assets (JS/CSS) funcionarem no GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 3000
  }
});