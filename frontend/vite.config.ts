import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allow importing from convex/_generated outside project root
      '../convex': path.resolve(__dirname, '../convex'),
    },
  },
  optimizeDeps: {
    exclude: ['convex/server'],
  },
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
    commonjsOptions: {
      ignore: ['convex/server'],
    },
    // Code splitting configuration
    rollupOptions: {
      external: ['convex/server'],
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
    fs: {
      // Allow serving files from parent directory (for convex/_generated)
      allow: ['..'],
    },
  },
})
