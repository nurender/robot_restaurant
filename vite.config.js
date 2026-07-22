import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// trigger restart
import purgecss from 'vite-plugin-purgecss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    purgecss({
      content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}']
    })
  ],
  server: {
    port: 5174,
    strictPort: true
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
