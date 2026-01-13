import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// MINIMAL CONFIG - Testing if build completes without optimizations
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '../convex': path.resolve(__dirname, '../convex'),
      'convex/server': path.resolve(__dirname, './convex-server-stub.js'),
    },
  },
  build: {
    target: 'es2015',
    // DISABLE TERSER - Test if minification is the issue
    minify: false,
    // DISABLE MANUAL CHUNKS - Test if code splitting is the issue
    rollupOptions: {
      output: {
        // No manual chunking
      },
    },
  },
  server: {
    hmr: {
      overlay: true,
    },
    fs: {
      allow: ['..'],
    },
  },
})
