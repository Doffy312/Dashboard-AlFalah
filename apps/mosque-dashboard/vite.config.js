import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// ── Custom Plugin: Strip modulepreload for lazy-loaded chunks ──────────
// Vite auto-injects <link rel="modulepreload"> for ALL vendor chunks,
// including ones only used by lazy routes (e.g. vendor-charts ~400KB, vendor-map ~140KB).
// This plugin removes those hints so the browser only fetches them
// when React.lazy actually triggers the dynamic import().
function stripLazyModulePreload() {
// Chunks that should NOT be eagerly preloaded
  return {
    name: 'strip-lazy-modulepreload',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /\s*<link\s+rel="modulepreload"[^>]*href="[^"]*(?:vendor-charts|vendor-socketio|vendor-datefns|vendor-icons|vendor-map)[^"]*"[^>]*>\s*/g,
        '\n'
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    stripLazyModulePreload(),
  ],

  // ── Build Optimizations ──────────────────────────────────────────────
  build: {
    // Modern target for smaller, more optimized output
    target: 'es2020',

    // Use terser for ~15-25% better minification than default esbuild
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // strip console.log in production
        drop_debugger: true,
        passes: 2,            // extra pass for better compression
      },
      format: {
        comments: false,      // strip all comments
      },
    },

    // Enable CSS code splitting per async chunk
    cssCodeSplit: true,
    // Use esbuild for standard fast & compact CSS minification
    cssMinify: 'esbuild',

    // Warn when a chunk exceeds 200KB (helps catch regressions)
    chunkSizeWarningLimit: 200,

    rollupOptions: {
      output: {
        // Granular vendor chunking — each library cached independently.
        // ORDER MATTERS: React must be matched first so that shared deps
        // (react, react-dom, scheduler, react-is) don't leak into other
        // vendor chunks like vendor-charts.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // ── 1. React core + routing (must be first) ──────────────
            // Catches: react, react-dom, react-router-dom, react-is,
            //          scheduler, use-sync-external-store, etc.
            if (
              /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|react-is|scheduler|use-sync-external-store)[\\/]/.test(id)
            ) {
              return 'vendor-react';
            }
            // ── 2. Data fetching layer ───────────────────────────────
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // ── 3. Charting library (~400KB) — only used by 3 pages ──
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts';
            }
            // ── 4. Leaflet Map (~140KB) — lazy loaded for map ──────
            if (id.includes('leaflet')) {
              return 'vendor-map';
            }
            // ── 5. Icon library ──────────────────────────────────────
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // ── 6. Auth client ───────────────────────────────────────
            if (id.includes('better-auth')) {
              return 'vendor-auth';
            }
            // ── 7. Socket.io — only needed inside DashboardLayout ────
            if (id.includes('socket.io') || id.includes('engine.io')) {
              return 'vendor-socketio';
            }
            // ── 8. Date utilities ────────────────────────────────────
            if (id.includes('date-fns')) {
              return 'vendor-datefns';
            }
          }
        },
      },
    },
  },

  // ── Dev Server ───────────────────────────────────────────────────────
  server: {
    host: true, // Enables local network IP access (for mobile testing)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})


