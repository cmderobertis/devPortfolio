import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // VitePWA temporarily disabled for bundle optimization
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    //   },
    //   manifest: {
    //     name: 'Cameron De Robertis - Developer Portfolio',
    //     short_name: 'DevPortfolio',
    //     description: 'Interactive developer portfolio showcasing React simulations and projects',
    //     theme_color: '#1976d2'
    //   }
    // }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Better visualization
      sourcemap: true
    })
  ],
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        properties: {
          regex: /^_/
        }
      }
    },
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        // Enhanced manual chunking strategy for optimal bundle splitting
        manualChunks: (id) => {
          // React ecosystem - split more granularly
          if (id.includes('react-dom')) {
            return 'vendor-react-dom';
          }
          
          if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-router')) {
            return 'vendor-react-core';
          }
          
          // Router and state management
          if (id.includes('react-router-dom') || id.includes('zustand')) {
            return 'vendor-routing';
          }
          
          // Exclude heavy UI libraries from initial bundle
          if (id.includes('bootstrap')) {
            // Bootstrap will be loaded only by pages that need it
            return 'vendor-bootstrap-lazy';
          }
          
          if (id.includes('lucide-react')) {
            return 'vendor-icons-lazy';
          }
          
          if (id.includes('@fortawesome') || id.includes('98.css')) {
            return 'vendor-styles-lazy';
          }
          
          // Heavy simulation dependencies
          if (id.includes('@dnd-kit') || id.includes('reactflow') || 
              id.includes('@tanstack/react-table')) {
            return 'vendor-simulation';
          }
          
          // Split utility libraries
          if (id.includes('axios')) {
            return 'vendor-http';
          }
          
          if (id.includes('date-fns')) {
            return 'vendor-date';
          }
          
          if (id.includes('react-slick') || id.includes('slick-carousel')) {
            return 'vendor-carousel';
          }
          
          if (id.includes('prop-types') || id.includes('react-querybuilder')) {
            return 'vendor-misc-utils';
          }
          
          // Separate each heavy simulation page into its own chunk
          if (id.includes('src/pages/EmergenceEngine.jsx') || 
              id.includes('src/engine/EmergenceEngineCore')) {
            return 'page-emergence';
          }
          
          if (id.includes('src/pages/GameOfLife.jsx') || 
              id.includes('src/pages/GameOfLifeModern.jsx') || 
              id.includes('src/engine/CellularAutomata')) {
            return 'page-gameoflife';
          }
          
          if (id.includes('src/pages/Breakout.tsx')) {
            return 'page-breakout';
          }
          
          if (id.includes('src/pages/MazeStudio.jsx')) {
            return 'page-maze';
          }
          
          if (id.includes('src/pages/Prisms.jsx') || 
              id.includes('src/pages/Prisms3D.jsx')) {
            return 'page-prisms';
          }
          
          if (id.includes('src/pages/DatabaseEditor.jsx')) {
            return 'page-database';
          }
          
          // Group lighter pages together
          if (id.includes('src/pages/Bio.jsx') || 
              id.includes('src/pages/Resume.jsx') || 
              id.includes('src/pages/Projects.jsx') || 
              id.includes('src/pages/InteractiveShowcase.jsx')) {
            return 'pages-static';
          }
          
          // Split components by usage pattern
          if (id.includes('src/components/Navbar') || 
              id.includes('src/components/ThemeToggle')) {
            return 'components-core';
          }
          
          if (id.includes('src/components/PerformanceMonitor')) {
            return 'components-dev';
          }
          
          if (id.includes('src/components/')) {
            return 'components-misc';
          }
          
          // Design system and styles
          if (id.includes('src/design-system/') || 
              id.includes('src/styles/') || 
              id.includes('src/context/')) {
            return 'design-system';
          }
          
          // Node modules not already chunked
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
          
          // Default chunk for remaining files
          return 'main';
        },
        // Optimize chunk file names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.[jt]sx?$/, '')
            : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/[name]-[hash].css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
      // External dependencies to reduce bundle size
      external: (id) => {
        // Don't externalize anything for now, but this could be used
        // for CDN-loaded libraries in production
        return false;
      }
    },
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    // Enhanced minification settings
    // Reduce asset inline threshold to ensure more assets are separate
    assetsInlineLimit: 512 // 512 bytes instead of default 4KB
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
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
      // Only essential dependencies for initial load
      'react',
      'react-dom',
      'react-router-dom'
    ],
    exclude: [
      // Exclude ALL heavy libraries - load on demand
      'bootstrap', // 231KB CSS - too heavy for initial load
      '@fortawesome/fontawesome-free', // Heavy icon library
      'lucide-react',
      'zustand',
      'date-fns',
      'reactflow',
      '@tanstack/react-table',
      'react-querybuilder',
      '98.css',
      'react-slick',
      'slick-carousel',
      '@dnd-kit/core'
    ]
  },
  // Performance monitoring in development
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PERFORMANCE_MONITORING__: JSON.stringify(true)
  }
})
