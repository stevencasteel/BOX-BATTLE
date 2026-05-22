import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: "/BOX-BATTLE/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 6502,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('zustand')) {
              return 'vendor-zustand';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('tone')) {
              return 'vendor-tone';
            }
            if (id.includes('react-syntax-highlighter') || id.includes('prismjs')) {
              return 'vendor-highlighter';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500,
  }
})
