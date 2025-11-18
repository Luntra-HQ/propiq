import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle size
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      external: [
        // Don't bundle Convex server imports
        'convex/server',
      ],
      output: {
        manualChunks: {
          // Vendor chunks for large libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['lucide-react', 'styled-components'],
          'vendor-utils': ['axios', 'jspdf', 'html2canvas'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500, // KB
  },
  // Performance hints
  server: {
    hmr: {
      overlay: true,
    },
  },
})
