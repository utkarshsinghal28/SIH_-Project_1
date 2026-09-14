import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const clientRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite configuration for the Krishi Procurement Platform client (Part 1).
 *
 * The production bundle is emitted into the repository `public/` folder so the
 * sandbox preview host can serve the SPA as plain static files. When you run
 * this project locally you only ever need the Vite dev server (`npm run dev:client`).
 */
export default defineConfig({
  root: clientRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(clientRoot, 'src'),
    },
  },
  build: {
    outDir: path.resolve(clientRoot, '..', 'public'),
    emptyOutDir: false,
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
