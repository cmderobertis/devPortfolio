/**
 * UI Slice - User interface state management
 * Features: Responsive design, theme management, component states
 */

export const createUISlice = (set, get) => ({
  ui: {
    // Layout and responsive design
    breakpoint: 'lg', // xs, sm, md, lg, xl, xxl
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 1200,
      height: typeof window !== 'undefined' ? window.innerHeight : 800,
      orientation: 'landscape'
    },
    
    // Navigation and layout
    sidebarCollapsed: false,
    navigationOpen: false,
    
    // Theme and appearance
    preferredTheme: 'auto', // light, dark, auto
    highContrastMode: false,
    animationsEnabled: true,
    
    // Component states
    modals: new Map(), // Track open modals
    tooltips: new Map(), // Track active tooltips
    dropdowns: new Map(), // Track open dropdowns
    
    // Loading and transitions
    pageTransition: {
      isTransitioning: false,
      from: null,
      to: null,
      progress: 0
    },
    
    // Focus management
    focusOutline: true,
    keyboardUser: false, // Detected based on tab usage
    
    // Debug and development
    debugMode: false,
    showPerformanceOverlay: false,
    showAccessibilityOverlay: false,
    
    // User preferences
    preferences: {
      autoSaveInterval: 5000,
      maxNotifications: 5,
      soundEnabled: false,
      autoPlayAnimations: true,
      preferredLanguage: 'en-US'
    }
  },

  // Responsive design management
  setBreakpoint: (breakpoint) => {
    set((state) => {
      state.ui.breakpoint = breakpoint
      
      // Adjust sidebar behavior based on breakpoint
      if (['xs', 'sm'].includes(breakpoint) && !state.ui.sidebarCollapsed) {
        state.ui.sidebarCollapsed = true
      }
    })
  },

  updateViewport: (width, height) => {
    set((state) => {
      state.ui.viewport.width = width
      state.ui.viewport.height = height
      state.ui.viewport.orientation = width > height ? 'landscape' : 'portrait'
      
      // Determine breakpoint based on width
      let breakpoint = 'xs'
      if (width >= 1400) breakpoint = 'xxl'
      else if (width >= 1200) breakpoint = 'xl'
      else if (width >= 992) breakpoint = 'lg'
      else if (width >= 768) breakpoint = 'md'
      else if (width >= 576) breakpoint = 'sm'
      
      if (breakpoint !== state.ui.breakpoint) {
        get().setBreakpoint(breakpoint)
      }
    })
  },

  // Navigation and layout controls
  toggleSidebar: () => {
    set((state) => {
      state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed
    })
  },

  toggleNavigation: () => {
    set((state) => {
      state.ui.navigationOpen = !state.ui.navigationOpen
      
      // Close navigation when opening on mobile
      if (state.ui.navigationOpen && ['xs', 'sm'].includes(state.ui.breakpoint)) {
        // Auto-close after navigation
        setTimeout(() => {
          set((draft) => {
            draft.ui.navigationOpen = false
          })
        }, 300)
      }
    })
  },

  // Theme management
  setTheme: (theme) => {
    set((state) => {
      state.ui.preferredTheme = theme
      
      get().addNotification({
        type: 'info',
        title: 'Theme Changed',
        message: `Switched to ${theme} theme`,
        duration: 2000
      })
    })
  },

  toggleAnimations: () => {
    set((state) => {
      state.ui.animationsEnabled = !state.ui.animationsEnabled
      
      // Apply to DOM
      document.documentElement.classList.toggle('animations-disabled', !state.ui.animationsEnabled)
      
      get().addNotification({
        type: 'info',
        title: 'Animations',
        message: state.ui.animationsEnabled ? 'Enabled' : 'Disabled',
        duration: 2000
      })
    })
  },

  // Modal management
  openModal: (modalId, props = {}) => {
    set((state) => {
      state.ui.modals.set(modalId, {
        isOpen: true,
        props,
        openedAt: new Date().toISOString()
      })
    })
  },

  closeModal: (modalId) => {
    set((state) => {
      if (state.ui.modals.has(modalId)) {
        const modal = state.ui.modals.get(modalId)
        modal.isOpen = false
        modal.closedAt = new Date().toISOString()
        
        // Remove after animation
        setTimeout(() => {
          set((draft) => {
            draft.ui.modals.delete(modalId)
          })
        }, 300)
      }
    })
  },

  closeAllModals: () => {
    set((state) => {
      state.ui.modals.forEach((modal, id) => {
        get().closeModal(id)
      })
    })
  },

  // Tooltip management
  showTooltip: (tooltipId, element, content, position = 'top') => {
    set((state) => {
      state.ui.tooltips.set(tooltipId, {
        element,
        content,
        position,
        visible: true,
        timestamp: new Date().toISOString()
      })
    })
  },

  hideTooltip: (tooltipId) => {
    set((state) => {
      state.ui.tooltips.delete(tooltipId)
    })
  },

  // Dropdown management
  openDropdown: (dropdownId, props = {}) => {
    set((state) => {
      // Close other dropdowns
      state.ui.dropdowns.clear()
      
      state.ui.dropdowns.set(dropdownId, {
        isOpen: true,
        props,
        openedAt: new Date().toISOString()
      })
    })
  },

  closeDropdown: (dropdownId) => {
    set((state) => {
      state.ui.dropdowns.delete(dropdownId)
    })
  },

  closeAllDropdowns: () => {
    set((state) => {
      state.ui.dropdowns.clear()
    })
  },

  // Page transition management
  startPageTransition: (from, to) => {
    set((state) => {
      state.ui.pageTransition = {
        isTransitioning: true,
        from,
        to,
        progress: 0
      }
    })
  },

  updatePageTransitionProgress: (progress) => {
    set((state) => {
      state.ui.pageTransition.progress = Math.max(0, Math.min(100, progress))
    })
  },

  endPageTransition: () => {
    set((state) => {
      state.ui.pageTransition = {
        isTransitioning: false,
        from: null,
        to: null,
        progress: 0
      }
    })
  },

  // Focus and keyboard management
  setKeyboardUser: (isKeyboardUser) => {
    set((state) => {
      state.ui.keyboardUser = isKeyboardUser
      
      // Apply focus outline visibility
      document.documentElement.classList.toggle('keyboard-user', isKeyboardUser)
    })
  },

  toggleFocusOutline: () => {
    set((state) => {
      state.ui.focusOutline = !state.ui.focusOutline
      
      document.documentElement.classList.toggle('no-focus-outline', !state.ui.focusOutline)
    })
  },

  // Debug and development controls
  toggleDebugMode: () => {
    set((state) => {
      state.ui.debugMode = !state.ui.debugMode
      
      // Enable console logging in debug mode
      if (state.ui.debugMode) {
        console.log('🐛 Debug mode enabled')
        window.__PORTFOLIO_DEBUG__ = true
      } else {
        console.log('🐛 Debug mode disabled')
        delete window.__PORTFOLIO_DEBUG__
      }
    })
  },

  togglePerformanceOverlay: () => {
    set((state) => {
      state.ui.showPerformanceOverlay = !state.ui.showPerformanceOverlay
    })
  },

  toggleAccessibilityOverlay: () => {
    set((state) => {
      state.ui.showAccessibilityOverlay = !state.ui.showAccessibilityOverlay
    })
  },

  // User preferences
  updatePreference: (key, value) => {
    set((state) => {
      if (key in state.ui.preferences) {
        state.ui.preferences[key] = value
        
        // Persist preferences
        localStorage.setItem('ui-preferences', JSON.stringify(state.ui.preferences))
      }
    })
  },

  resetPreferences: () => {
    set((state) => {
      state.ui.preferences = {
        autoSaveInterval: 5000,
        maxNotifications: 5,
        soundEnabled: false,
        autoPlayAnimations: true,
        preferredLanguage: 'en-US'
      }
      
      localStorage.removeItem('ui-preferences')
    })
  },

  // Utility methods
  isMobile: () => {
    const state = get()
    return ['xs', 'sm'].includes(state.ui.breakpoint)
  },

  isDesktop: () => {
    const state = get()
    return ['lg', 'xl', 'xxl'].includes(state.ui.breakpoint)
  },

  hasActiveModal: () => {
    const state = get()
    return Array.from(state.ui.modals.values()).some(modal => modal.isOpen)
  },

  getActiveModals: () => {
    const state = get()
    return Array.from(state.ui.modals.entries())
      .filter(([id, modal]) => modal.isOpen)
      .map(([id, modal]) => ({ id, ...modal }))
  }
})