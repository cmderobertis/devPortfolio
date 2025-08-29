/**
 * App State Slice - Core application state management
 * Features: Notifications, loading states, error handling
 */

export const createAppStateSlice = (set, get) => ({
  app: {
    // Loading states
    isLoading: false,
    loadingStates: new Map(), // For tracking multiple concurrent loading states
    
    // Error handling
    error: null,
    errorHistory: [],
    
    // Notifications system
    notifications: [],
    
    // App metadata
    version: '3.0.0',
    buildTime: Date.now(),
    
    // Feature flags
    featureFlags: {
      concurrentRendering: true,
      advancedErrorBoundaries: true,
      performanceMonitoring: true,
      accessibilityMonitoring: true,
      debugMode: process.env.NODE_ENV === 'development'
    }
  },

  // Loading state management
  setLoading: (isLoading, key = 'global') => {
    set((state) => {
      if (key === 'global') {
        state.app.isLoading = isLoading
      } else {
        if (isLoading) {
          state.app.loadingStates.set(key, true)
        } else {
          state.app.loadingStates.delete(key)
        }
      }
    })
  },

  // Check if any loading state is active
  isAnyLoading: () => {
    const state = get()
    return state.app.isLoading || state.app.loadingStates.size > 0
  },

  // Error management
  setError: (error, context = null) => {
    set((state) => {
      const errorEntry = {
        id: `error_${Date.now()}`,
        message: error?.message || error,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        context,
        resolved: false
      }
      
      state.app.error = errorEntry
      state.app.errorHistory.push(errorEntry)
      
      // Keep only last 10 errors
      if (state.app.errorHistory.length > 10) {
        state.app.errorHistory.shift()
      }
    })
  },

  clearError: () => {
    set((state) => {
      if (state.app.error) {
        // Mark as resolved in history
        const errorIndex = state.app.errorHistory.findIndex(
          e => e.id === state.app.error.id
        )
        if (errorIndex !== -1) {
          state.app.errorHistory[errorIndex].resolved = true
        }
      }
      state.app.error = null
    })
  },

  // Notification system
  addNotification: (notification) => {
    set((state) => {
      const newNotification = {
        id: `notification_${Date.now()}`,
        type: 'info', // info, success, warning, error
        autoClose: true,
        duration: 5000,
        timestamp: new Date().toISOString(),
        ...notification
      }
      
      state.app.notifications.push(newNotification)
      
      // Auto-close if enabled
      if (newNotification.autoClose && newNotification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(newNotification.id)
        }, newNotification.duration)
      }
    })
  },

  removeNotification: (id) => {
    set((state) => {
      state.app.notifications = state.app.notifications.filter(n => n.id !== id)
    })
  },

  clearAllNotifications: () => {
    set((state) => {
      state.app.notifications = []
    })
  },

  // Feature flag management
  toggleFeatureFlag: (flag) => {
    set((state) => {
      if (flag in state.app.featureFlags) {
        state.app.featureFlags[flag] = !state.app.featureFlags[flag]
      }
    })
  },

  setFeatureFlag: (flag, value) => {
    set((state) => {
      state.app.featureFlags[flag] = value
    })
  },

  // Batch operations for performance
  batchAppUpdates: (updates) => {
    set((state) => {
      Object.entries(updates).forEach(([key, value]) => {
        if (key in state.app) {
          state.app[key] = value
        }
      })
    })
  }
})