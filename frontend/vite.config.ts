import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Prevent accidentally bundling Convex backend code into the frontend.
 *
 * Frontend may import Convex generated artifacts only:
 * - `frontend/convex/_generated/*`
 *
 * It must NOT import backend modules from:
 * - `../convex/*` (repo root Convex functions)
 *
 * If backend code is imported, the build should fail loudly.
 */
function forbidBackendConvexImports() {
  const backendConvexRoot = path.resolve(__dirname, '..', 'convex') + path.sep;
  const backendGeneratedRoot = path.resolve(__dirname, '..', 'convex', '_generated') + path.sep;
  const frontendConvexRoot = path.resolve(__dirname, 'convex') + path.sep;
  const frontendGeneratedRoot = path.resolve(__dirname, 'convex', '_generated') + path.sep;

  return {
    name: 'forbid-backend-convex-imports',
    enforce: 'pre' as const,
    async resolveId(source: string, importer: string | undefined) {
      // Only care about convex-ish paths. Keep this cheap.
      if (
        !source.includes('convex') &&
        !source.startsWith('../convex') &&
        !source.startsWith('../../convex')
      ) {
        return null;
      }

      const resolved = await this.resolve(source, importer, { skipSelf: true });
      if (!resolved?.id) return null;

      // Allow frontend-local generated artifacts.
      if (resolved.id.startsWith(frontendGeneratedRoot)) return null;
      // Allow backend generated artifacts too (these are safe function references).
      // Note: in this repo, frontend/convex/_generated files may be hard-linked to backend.
      if (resolved.id.startsWith(backendGeneratedRoot)) return null;

      // Allow anything inside the frontend local convex folder (e.g. if needed later),
      // but keep backend convex forbidden.
      if (resolved.id.startsWith(frontendConvexRoot)) return null;

      // Forbid pulling anything from the backend convex directory.
      if (resolved.id.startsWith(backendConvexRoot)) {
        throw new Error(
          [
            '[VITE] Forbidden import: Convex backend code was pulled into the frontend bundle.',
            `Import: ${source}`,
            `From: ${importer || '(unknown)'}`,
            `Resolved: ${resolved.id}`,
            '',
            'Fix: import only from `frontend/convex/_generated/*` in the frontend.',
          ].join('\n')
        );
      }

      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [forbidBackendConvexImports(), react()],
  resolve: {
    alias: {
      // ShadCN components alias
      '@': path.resolve(__dirname, './src'),
      // ONLY allow importing from convex/_generated (not backend modules!)
      '../convex/_generated': path.resolve(__dirname, './convex/_generated'),
      // Stub for convex/server (Node.js-only module)
      'convex/server': path.resolve(__dirname, './convex-server-stub.js'),
    },
  },
  build: {
    // Optimize bundle size
    target: 'es2020', // Updated from es2015 for better tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'], // Remove specific console methods
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Fix Safari 10 bug
      },
    },
    // Code splitting configuration
    rollupOptions: {
      // If the forbid plugin misses something, keep Rollup from pulling in backend code.
      // Note: this matches *resolved absolute paths* too.
      external: (id) => {
        const backendConvexRoot = path.resolve(__dirname, '..', 'convex') + path.sep;
        const backendGeneratedRoot = path.resolve(__dirname, '..', 'convex', '_generated') + path.sep;
        const frontendGeneratedRoot = path.resolve(__dirname, 'convex', '_generated') + path.sep;
        if (id.startsWith(frontendGeneratedRoot)) return false;
        if (id.startsWith(backendGeneratedRoot)) return false;
        return id.startsWith(backendConvexRoot);
      },
      output: {
        // Simplified code splitting for reliable builds
        manualChunks: {
          // React core (most critical, cache forever)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Large UI libraries
          'vendor-ui': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          // PDF and utilities (heavy, lazy loaded)
          'vendor-pdf': ['jspdf', 'html2canvas'],
          // HTTP and backend
          'vendor-backend': ['axios', 'convex'],
        },
        // Better chunking strategy
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 300, // KB - reduced from 500 for better splitting
  },
  // Performance hints
  server: {
    host: 'localhost',
    port: 5173,
    open: false,
    hmr: {
      overlay: true,
    },
    fs: {
      // Frontend should not need parent directory access.
      allow: [path.resolve(__dirname)],
    },
  },
})
