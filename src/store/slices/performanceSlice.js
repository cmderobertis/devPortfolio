/**
 * Performance Slice - Enhanced performance monitoring with React 18 integration
 * Features: Concurrent rendering metrics, Core Web Vitals, bundle monitoring
 */

export const createPerformanceSlice = (set, get) => ({
  performance: {
    // Current performance snapshot
    current: {
      score: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      fcp: 0
    },
    
    // Performance metrics over time
    metrics: {
      history: [],
      trend: 'stable', // improving, stable, degrading
      lastUpdate: null
    },
    
    // React 18 specific metrics
    concurrent: {
      transitionsActive: 0,
      suspenseBoundaries: 0,
      deferredUpdatesCount: 0,
      timeSlicing: false
    },
    
    // Bundle monitoring
    bundle: {
      size: 0,
      chunks: {},
      unused: [],
      recommendations: []
    },
    
    // Monitoring state
    isMonitoring: true,
    alertThresholds: {
      score: 70,
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      bundleSize: 500 * 1024 // 500KB
    },
    
    // Real-time alerts
    activeAlerts: []
  },

  // Performance metrics updates
  updatePerformanceMetrics: (metrics) => {
    set((state) => {
      const previousScore = state.performance.current.score
      
      // Update current metrics
      state.performance.current = { ...state.performance.current, ...metrics }
      
      // Add to history with timestamp
      const historyEntry = {
        ...state.performance.current,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
      
      state.performance.metrics.history.push(historyEntry)
      state.performance.metrics.lastUpdate = new Date().toISOString()
      
      // Keep only last 50 entries
      if (state.performance.metrics.history.length > 50) {
        state.performance.metrics.history.shift()
      }
      
      // Calculate trend
      const currentScore = state.performance.current.score
      if (currentScore > previousScore + 5) {
        state.performance.metrics.trend = 'improving'
      } else if (currentScore < previousScore - 5) {
        state.performance.metrics.trend = 'degrading'
      } else {
        state.performance.metrics.trend = 'stable'
      }
      
      // Check for alerts
      get().checkPerformanceAlerts()
    })
  },

  // React 18 concurrent features tracking
  updateConcurrentMetrics: (metrics) => {
    set((state) => {
      state.performance.concurrent = { ...state.performance.concurrent, ...metrics }
    })
  },

  recordTransition: (name, duration) => {
    set((state) => {
      state.performance.concurrent.transitionsActive++
      
      // Add notification for slow transitions
      if (duration > 1000) {
        get().addNotification({
          type: 'warning',
          title: 'Slow Transition',
          message: `Transition "${name}" took ${duration}ms`,
          duration: 3000
        })
      }
    })
  },

  recordSuspenseBoundary: (componentName, loadTime) => {
    set((state) => {
      state.performance.concurrent.suspenseBoundaries++
      
      // Track slow lazy loading
      if (loadTime > 2000) {
        get().addNotification({
          type: 'info',
          title: 'Lazy Loading',
          message: `${componentName} took ${loadTime}ms to load`,
          duration: 2000
        })
      }
    })
  },

  // Bundle size monitoring
  updateBundleMetrics: (bundleData) => {
    set((state) => {
      state.performance.bundle = { ...state.performance.bundle, ...bundleData }
      
      // Check bundle size threshold
      if (bundleData.size > state.performance.alertThresholds.bundleSize) {
        get().addPerformanceAlert({
          type: 'warning',
          metric: 'bundleSize',
          value: bundleData.size,
          threshold: state.performance.alertThresholds.bundleSize,
          message: `Bundle size (${(bundleData.size / 1024).toFixed(1)}KB) exceeds threshold`
        })
      }
    })
  },

  // Performance monitoring toggle
  togglePerformanceMonitoring: () => {
    set((state) => {
      state.performance.isMonitoring = !state.performance.isMonitoring
      
      get().addNotification({
        type: 'info',
        title: 'Performance Monitoring',
        message: state.performance.isMonitoring ? 'Enabled' : 'Disabled',
        duration: 2000
      })
    })
  },

  // Alert system
  addPerformanceAlert: (alert) => {
    set((state) => {
      const newAlert = {
        id: `perf_alert_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...alert
      }
      
      state.performance.activeAlerts.push(newAlert)
      
      // Also add as notification
      get().addNotification({
        type: alert.type || 'warning',
        title: 'Performance Alert',
        message: alert.message,
        duration: 5000
      })
    })
  },

  removePerformanceAlert: (id) => {
    set((state) => {
      state.performance.activeAlerts = state.performance.activeAlerts.filter(
        alert => alert.id !== id
      )
    })
  },

  // Check all performance thresholds
  checkPerformanceAlerts: () => {
    const state = get()
    const current = state.performance.current
    const thresholds = state.performance.alertThresholds
    
    // Clear existing alerts
    set((draft) => {
      draft.performance.activeAlerts = []
    })
    
    // Check each metric
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      if (current[metric] && current[metric] > threshold) {
        get().addPerformanceAlert({
          type: 'warning',
          metric,
          value: current[metric],
          threshold,
          message: `${metric.toUpperCase()} (${current[metric]}) exceeds threshold (${threshold})`
        })
      }
    })
  },

  // Performance recommendations
  generateRecommendations: () => {
    const state = get()
    const current = state.performance.current
    const recommendations = []
    
    if (current.lcp > 2500) {
      recommendations.push({
        type: 'lcp',
        severity: 'high',
        message: 'Consider optimizing largest contentful paint with image optimization and critical CSS'
      })
    }
    
    if (current.cls > 0.1) {
      recommendations.push({
        type: 'cls',
        severity: 'medium',
        message: 'Reduce cumulative layout shift by setting image dimensions and avoiding dynamic content'
      })
    }
    
    if (state.performance.bundle.size > 400 * 1024) {
      recommendations.push({
        type: 'bundle',
        severity: 'medium',
        message: 'Consider code splitting and lazy loading to reduce bundle size'
      })
    }
    
    set((draft) => {
      draft.performance.bundle.recommendations = recommendations
    })
    
    return recommendations
  },

  // Timing utilities
  recordTiming: (name, duration, metadata = {}) => {
    set((state) => {
      if (!state.performance.timings) {
        state.performance.timings = {}
      }
      
      if (!state.performance.timings[name]) {
        state.performance.timings[name] = []
      }
      
      state.performance.timings[name].push({
        duration,
        timestamp: new Date().toISOString(),
        ...metadata
      })
      
      // Keep only last 20 timings per name
      if (state.performance.timings[name].length > 20) {
        state.performance.timings[name].shift()
      }
    })
  }
})