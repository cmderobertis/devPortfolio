import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false, // Set to true to auto-open the bundle analysis
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
      template: 'treemap'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Cameron De Robertis - Developer Portfolio',
        short_name: 'CDR Portfolio',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  build: {
    target: 'es2015', // Modern browser support
    chunkSizeWarningLimit: 500, // Warn if chunks exceed 500KB
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: (id) => {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react-router-dom') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('bootstrap') || id.includes('slick') || id.includes('lucide')) {
              return 'ui-vendor';
            }
            // Simulation/visualization libraries
            if (id.includes('reactflow') || id.includes('@dnd-kit') || id.includes('@tanstack')) {
              return 'visualization-vendor';
            }
            // Remaining vendor deps
            return 'vendor';
          }
          // Code splitting for pages
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('/')[0];
            // Group interactive simulations together
            if (['GameOfLife', 'EmergenceEngine', 'DvdBouncer', 'BreakoutGame', 'DuckKonundrum'].includes(pageName)) {
              return 'simulations';
            }
            return `page-${pageName.toLowerCase()}`;
          }
          // Components chunk
          if (id.includes('/components/')) {
            return 'components';
          }
        },
        // Asset filename patterns
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(-1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      }
    },
    // Enable minification and compression
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false, // Disable in production for smaller bundles
    // Performance optimizations
    reportCompressedSize: false, // Faster builds
    cssMinify: true
  },
  // CSS optimization
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      css: {
        charset: false // Remove charset warnings
      }
    }
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom'
    ],
    exclude: []
  }
})