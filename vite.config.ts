import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,ts,tsx,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}`;
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Cameron De Robertis - Developer Portfolio',
        short_name: 'DevPortfolio',
        description: 'Interactive developer portfolio showcasing React simulations and projects',
        theme_color: '#1976d2',
        icons: [
          {
            src: 'cd_favicon.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['bootstrap', 'lucide-react'],
          'vendor-simulation': ['@dnd-kit/core', 'reactflow'],
          'vendor-utils': ['axios', 'date-fns', 'prop-types'],
          'simulations': [
            './src/pages/EmergenceEngine.jsx',
            './src/pages/GameOfLife.jsx',
            './src/pages/Breakout.tsx',
            './src/pages/DvdBouncer.jsx',
            './src/engine/EmergenceEngineCore.ts',
            './src/engine/CellularAutomata.ts'
          ]
        }
      }
    },
    cssCodeSplit: true,
    cssMinify: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/design-system': resolve(__dirname, 'src/design-system'),
      '@/engine': resolve(__dirname, 'src/engine'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/types': resolve(__dirname, 'src/types'),
      // Legacy aliases for backward compatibility
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@design-system': resolve(__dirname, 'src/design-system'),
      '@engine': resolve(__dirname, 'src/engine'),
      '@hooks': resolve(__dirname, 'src/hooks')
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'bootstrap',
      'lucide-react'
    ],
    exclude: ['@vitejs/plugin-react']
  },
  // Environment variables and build-time constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PERFORMANCE_MONITORING__: JSON.stringify(true),
    __ENABLE_TESTING__: JSON.stringify(process.env.NODE_ENV === 'test')
  },
  // TypeScript support
  esbuild: {
    target: 'esnext',
    format: 'esm'
  },
  // Testing mode configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});