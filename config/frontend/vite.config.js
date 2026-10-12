import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/static/frontend/',
  build: {
    manifest: 'manifest.json',
    outDir: resolve('../BlockBot/static/frontend'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve('./src/main.jsx'),
      },
      output: {
        entryFileNames: 'app.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
