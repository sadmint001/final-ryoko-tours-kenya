import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Listen on all addresses
    port: 8080,
    strictPort: true,
    hmr: {
      clientPort: 8080, // Important: specify client port
      protocol: 'ws',
      host: 'localhost',
    },
    watch: {
      usePolling: true, // If you're in a Docker or WSL environment
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
})