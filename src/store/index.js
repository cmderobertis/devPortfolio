/**
 * Modern Zustand Store Architecture - Phase 3 Enhancement
 * Features: Store slicing, composition patterns, middleware, TypeScript preparation
 */

import { create } from 'zustand'
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Store slices for modular architecture
import { createAppStateSlice } from './slices/appStateSlice'
import { createPerformanceSlice } from './slices/performanceSlice'
import { createAccessibilitySlice } from './slices/accessibilitySlice'
import { createUISlice } from './slices/uiSlice'
import { createSimulationSlice } from './slices/simulationSlice'

// Advanced middleware composition
const withMiddleware = (storeCreator) => {
  return create(
    devtools(
      persist(
        subscribeWithSelector(
          immer(storeCreator)
        ),
        {
          name: 'dev-portfolio-store',
          partialize: (state) => ({
            // Only persist essential UI state
            ui: {
              sidebarCollapsed: state.ui.sidebarCollapsed,
              preferredTheme: state.ui.preferredTheme,
              debugMode: state.ui.debugMode
            },
            accessibility: {
              highContrast: state.accessibility.highContrast,
              reducedMotion: state.accessibility.reducedMotion,
              screenReaderMode: state.accessibility.screenReaderMode
            }
          }),
          version: 1,
        }
      ),
      { name: 'dev-portfolio-store' }
    )
  )
}

// Main store with composition pattern
export const useAppStore = withMiddleware((set, get) => ({
  // Compose all store slices
  ...createAppStateSlice(set, get),
  ...createPerformanceSlice(set, get),
  ...createAccessibilitySlice(set, get),
  ...createUISlice(set, get),
  ...createSimulationSlice(set, get),

  // Global store actions
  reset: () => {
    set((state) => {
      // Reset all slices while preserving essential data
      state.performance.metrics = { ...state.performance.metrics, history: [] }
      state.accessibility.violations = []
      state.simulations = {}
      state.app.notifications = []
    })
  },

  // Batch updates for performance
  batchUpdate: (updates) => {
    set((state) => {
      Object.entries(updates).forEach(([path, value]) => {
        const keys = path.split('.')
        let current = state
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
      })
    })
  }
}))

// Selector hooks for optimized subscriptions
export const useAppState = () => useAppStore(state => state.app)
export const usePerformanceState = () => useAppStore(state => state.performance)
export const useAccessibilityState = () => useAppStore(state => state.accessibility)
export const useUIState = () => useAppStore(state => state.ui)
export const useSimulationState = () => useAppStore(state => state.simulations)

// Specialized selectors with computed values
export const usePerformanceMetrics = () => useAppStore(state => ({
  current: state.performance.current,
  average: state.performance.metrics.history.length > 0
    ? state.performance.metrics.history.reduce((sum, m) => sum + m.score, 0) / state.performance.metrics.history.length
    : 0,
  trend: state.performance.metrics.trend
}))

export const useAccessibilityScore = () => useAppStore(state => ({
  score: state.accessibility.score,
  violations: state.accessibility.violations.length,
  critical: state.accessibility.violations.filter(v => v.impact === 'critical').length
}))

// Action-specific hooks for better separation of concerns
export const useAppActions = () => useAppStore(state => ({
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  setLoading: state.setLoading,
  setError: state.setError,
  reset: state.reset,
  batchUpdate: state.batchUpdate
}))

export const usePerformanceActions = () => useAppStore(state => ({
  updateMetrics: state.updatePerformanceMetrics,
  recordTiming: state.recordTiming,
  toggleMonitoring: state.togglePerformanceMonitoring
}))

export const useAccessibilityActions = () => useAppStore(state => ({
  updateScore: state.updateAccessibilityScore,
  addViolation: state.addAccessibilityViolation,
  toggleHighContrast: state.toggleHighContrast,
  toggleReducedMotion: state.toggleReducedMotion,
  setScreenReaderMode: state.setScreenReaderMode
}))

export const useUIActions = () => useAppStore(state => ({
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
  toggleDebugMode: state.toggleDebugMode,
  setBreakpoint: state.setBreakpoint
}))

export const useSimulationActions = () => useAppStore(state => ({
  initSimulation: state.initSimulation,
  updateSimulation: state.updateSimulation,
  pauseSimulation: state.pauseSimulation,
  resetSimulation: state.resetSimulation
}))

// Store subscription utilities for React 18 concurrent features
export const subscribeToStore = (selector, callback) => {
  return useAppStore.subscribe(
    selector,
    callback,
    {
      equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b)
    }
  )
}

// Optimistic update patterns
export const useOptimisticUpdate = () => {
  const store = useAppStore()
  
  return {
    optimisticUpdate: (updateFn, rollbackData) => {
      // Apply optimistic update
      updateFn()
      
      // Return rollback function
      return () => {
        store.getState().batchUpdate(rollbackData)
      }
    }
  }
}

// Development utilities
if (process.env.NODE_ENV === 'development') {
  // Expose store to window for debugging
  window.__PORTFOLIO_STORE__ = useAppStore
  
  // Store state logger
  useAppStore.subscribe(
    (state) => state,
    (state, prevState) => {
      if (state.ui.debugMode) {
        console.group('🏪 Store Update')
        console.log('Previous:', prevState)
        console.log('Current:', state)
        console.groupEnd()
      }
    }
  )
}