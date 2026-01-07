import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ShadCN components alias
      '@': path.resolve(__dirname, './src'),
      // Allow importing from convex/_generated outside project root
      '../convex': path.resolve(__dirname, '../convex'),
      // Minimal stub for convex/server (Node.js-only module)
      'convex/server': path.resolve(__dirname, './convex-server-stub.js'),
    },
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
    // Code splitting configuration - SIMPLIFIED to fix React loading order
    rollupOptions: {
      output: {
        manualChunks(id) {
          // CRITICAL: React must NOT be split to avoid loading order issues
          // Keep React in main bundle to ensure it's always available first

          // Convex (database SDK)
          if (id.includes('node_modules/convex')) {
            return 'vendor-convex';
          }

          // Sentry (error tracking)
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-sentry';
          }

          // PDF generation (heavy, only used in export)
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'vendor-pdf';
          }

          // All other node_modules (including React - keep together)
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 600, // KB (increased slightly to account for split chunks)
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
