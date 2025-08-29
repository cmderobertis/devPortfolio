/**
 * Phase 3 - React 18 Concurrent Features Integration
 * Enhanced main entry point with concurrent rendering, error boundaries, and performance monitoring
 */

import React, { Suspense, startTransition } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

// Phase 3: Enhanced store integration
import { useAppStore } from "./store"

// Phase 3: Advanced components
import { ConcurrentRoot } from "./components/concurrent/ConcurrentRoot"
import { GlobalErrorBoundary } from "./components/errors/GlobalErrorBoundary"
import { PerformanceProfiler } from "./components/performance/PerformanceProfiler"

// Critical styles loaded synchronously
import "./styles/material-design-3-tokens.css"
import "./styles/critical.css"

// Non-critical styles loaded asynchronously
const loadNonCriticalStyles = () => {
  return Promise.all([
    import("./styles/enhanced-material.css"),
    import("./styles/theme-transitions.css"),
    import("./styles/accessibility.css")
  ])
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  
  // Report to store
  const store = useAppStore.getState()
  store.setError(event.reason, 'unhandledPromiseRejection')
  
  // Prevent default browser error handling
  event.preventDefault()
})

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  
  // Report to store
  const store = useAppStore.getState()
  store.setError(event.error, 'globalError')
})

// Performance observer for Core Web Vitals
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const store = useAppStore.getState()
    
    entries.forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        store.updatePerformanceMetrics({ lcp: entry.startTime })
      } else if (entry.entryType === 'first-input') {
        store.updatePerformanceMetrics({ fid: entry.processingStart - entry.startTime })
      } else if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
        store.updatePerformanceMetrics({ cls: entry.value })
      }
    })
  })
  
  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
}

// App initialization with React 18 concurrent features
const initializeApp = () => {
  const rootElement = document.getElementById("root")
  
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  // Create React 18 concurrent root
  const root = createRoot(rootElement, {
    // Enable concurrent features
    identifierPrefix: 'portfolio-',
    onRecoverableError: (error) => {
      console.warn('Recoverable error:', error)
      const store = useAppStore.getState()
      store.setError(error, 'recoverableError')
    }
  })

  // Render app with concurrent features
  root.render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <PerformanceProfiler id="app-root">
          <ConcurrentRoot>
            <Suspense fallback={
              <div className="app-loading" role="status" aria-live="polite">
                <div className="loading-spinner" />
                <span>Loading application...</span>
              </div>
            }>
              <App />
            </Suspense>
          </ConcurrentRoot>
        </PerformanceProfiler>
      </GlobalErrorBoundary>
    </React.StrictMode>
  )
}

// Initialize app with transition for better UX
startTransition(() => {
  initializeApp()
  
  // Load non-critical resources
  loadNonCriticalStyles().catch(error => {
    console.warn('Failed to load non-critical styles:', error)
  })
})

// Service Worker registration (if available)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}
