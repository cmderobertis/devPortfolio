/**
 * Accessibility Slice - Enhanced accessibility state management
 * Features: WCAG compliance tracking, user preferences, violation monitoring
 */

export const createAccessibilitySlice = (set, get) => ({
  accessibility: {
    // Overall accessibility score
    score: 100,
    lastScanned: null,
    
    // WCAG compliance tracking
    wcagCompliance: {
      'A': { passed: 0, failed: 0, percentage: 100 },
      'AA': { passed: 0, failed: 0, percentage: 100 },
      'AAA': { passed: 0, failed: 0, percentage: 100 }
    },
    
    // Accessibility violations
    violations: [],
    violationHistory: [],
    
    // User accessibility preferences
    highContrast: false,
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    focusVisible: true,
    
    // Screen reader compatibility
    screenReader: {
      detected: null, // 'nvda', 'jaws', 'voiceover', 'talkback', etc.
      announcements: [],
      liveRegions: new Map()
    },
    
    // Keyboard navigation state
    keyboard: {
      trapActive: false,
      currentTrapId: null,
      focusHistory: [],
      skipLinksEnabled: true
    },
    
    // Color and contrast
    contrast: {
      currentRatio: null,
      meetingAA: true,
      meetingAAA: false,
      colorBlindnessSupport: true
    },
    
    // Monitoring settings
    isMonitoring: true,
    autoScan: true,
    scanInterval: 30000, // 30 seconds
    
    // Active alerts
    activeAlerts: []
  },

  // Score and compliance updates
  updateAccessibilityScore: (score, violations = []) => {
    set((state) => {
      state.accessibility.score = score
      state.accessibility.violations = violations
      state.accessibility.lastScanned = new Date().toISOString()
      
      // Update violation history
      const historyEntry = {
        timestamp: new Date().toISOString(),
        score,
        violationCount: violations.length,
        criticalViolations: violations.filter(v => v.impact === 'critical').length
      }
      
      state.accessibility.violationHistory.push(historyEntry)
      
      // Keep only last 20 scans
      if (state.accessibility.violationHistory.length > 20) {
        state.accessibility.violationHistory.shift()
      }
      
      // Update WCAG compliance
      get().calculateWCAGCompliance(violations)
      
      // Check for critical violations
      const criticalViolations = violations.filter(v => v.impact === 'critical')
      if (criticalViolations.length > 0) {
        get().addAccessibilityAlert({
          type: 'error',
          message: `${criticalViolations.length} critical accessibility violations found`,
          violations: criticalViolations
        })
      }
    })
  },

  // Calculate WCAG compliance percentages
  calculateWCAGCompliance: (violations) => {
    set((state) => {
      const levels = ['A', 'AA', 'AAA']
      
      levels.forEach(level => {
        const levelViolations = violations.filter(v => 
          v.tags && v.tags.some(tag => tag.includes(`wcag${level.toLowerCase()}`))
        )
        
        const totalRules = get().getWCAGRuleCount(level)
        const failed = levelViolations.length
        const passed = Math.max(0, totalRules - failed)
        const percentage = totalRules > 0 ? Math.round((passed / totalRules) * 100) : 100
        
        state.accessibility.wcagCompliance[level] = {
          passed,
          failed,
          percentage
        }
      })
    })
  },

  // Get estimated WCAG rule count for level
  getWCAGRuleCount: (level) => {
    const ruleCounts = { 'A': 25, 'AA': 38, 'AAA': 61 }
    return ruleCounts[level] || 25
  },

  // Add accessibility violation
  addAccessibilityViolation: (violation) => {
    set((state) => {
      const newViolation = {
        id: `violation_${Date.now()}`,
        timestamp: new Date().toISOString(),
        resolved: false,
        ...violation
      }
      
      state.accessibility.violations.push(newViolation)
    })
  },

  // Resolve accessibility violation
  resolveAccessibilityViolation: (id) => {
    set((state) => {
      const violation = state.accessibility.violations.find(v => v.id === id)
      if (violation) {
        violation.resolved = true
        violation.resolvedAt = new Date().toISOString()
      }
    })
  },

  // User preference management
  toggleHighContrast: () => {
    set((state) => {
      state.accessibility.highContrast = !state.accessibility.highContrast
      
      // Apply to DOM immediately
      document.documentElement.classList.toggle('high-contrast', state.accessibility.highContrast)
      
      get().addNotification({
        type: 'info',
        title: 'High Contrast',
        message: state.accessibility.highContrast ? 'Enabled' : 'Disabled',
        duration: 2000
      })
    })
  },

  toggleReducedMotion: () => {
    set((state) => {
      state.accessibility.reducedMotion = !state.accessibility.reducedMotion
      
      // Apply to DOM immediately
      document.documentElement.classList.toggle('reduce-motion', state.accessibility.reducedMotion)
      
      get().addNotification({
        type: 'info',
        title: 'Reduced Motion',
        message: state.accessibility.reducedMotion ? 'Enabled' : 'Disabled',
        duration: 2000
      })
    })
  },

  setScreenReaderMode: (enabled) => {
    set((state) => {
      state.accessibility.screenReaderMode = enabled
      
      if (enabled) {
        // Enable additional screen reader optimizations
        document.documentElement.classList.add('screen-reader-mode')
      } else {
        document.documentElement.classList.remove('screen-reader-mode')
      }
    })
  },

  // Screen reader management
  detectScreenReader: () => {
    set((state) => {
      // Basic screen reader detection
      const userAgent = navigator.userAgent.toLowerCase()
      let detected = null
      
      if (window.navigator.userAgent.indexOf('NVDA') > -1) {
        detected = 'nvda'
      } else if (window.speechSynthesis && window.speechSynthesis.getVoices) {
        // More sophisticated detection would be needed for real implementation
        detected = 'unknown'
      }
      
      state.accessibility.screenReader.detected = detected
    })
  },

  announceToScreenReader: (message, priority = 'polite') => {
    set((state) => {
      const announcement = {
        id: `announcement_${Date.now()}`,
        message,
        priority,
        timestamp: new Date().toISOString()
      }
      
      state.accessibility.screenReader.announcements.push(announcement)
      
      // Keep only last 10 announcements
      if (state.accessibility.screenReader.announcements.length > 10) {
        state.accessibility.screenReader.announcements.shift()
      }
    })
    
    // Actually announce to screen reader
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message
    document.body.appendChild(announcer)
    
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  // Keyboard navigation management
  setKeyboardTrap: (elementId, trapId) => {
    set((state) => {
      state.accessibility.keyboard.trapActive = true
      state.accessibility.keyboard.currentTrapId = trapId
      
      // Store focus history
      if (document.activeElement) {
        state.accessibility.keyboard.focusHistory.push({
          element: document.activeElement,
          timestamp: new Date().toISOString()
        })
      }
    })
  },

  releaseKeyboardTrap: () => {
    set((state) => {
      state.accessibility.keyboard.trapActive = false
      state.accessibility.keyboard.currentTrapId = null
      
      // Restore previous focus
      const lastFocus = state.accessibility.keyboard.focusHistory.pop()
      if (lastFocus && lastFocus.element) {
        try {
          lastFocus.element.focus()
        } catch (e) {
          // Element may no longer exist
          console.warn('Could not restore focus:', e)
        }
      }
    })
  },

  // Alert system
  addAccessibilityAlert: (alert) => {
    set((state) => {
      const newAlert = {
        id: `a11y_alert_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...alert
      }
      
      state.accessibility.activeAlerts.push(newAlert)
      
      // Also add as notification
      get().addNotification({
        type: alert.type || 'warning',
        title: 'Accessibility Alert',
        message: alert.message,
        duration: 5000
      })
      
      // Announce critical alerts to screen reader
      if (alert.type === 'error' || alert.type === 'critical') {
        get().announceToScreenReader(`Accessibility alert: ${alert.message}`, 'assertive')
      }
    })
  },

  removeAccessibilityAlert: (id) => {
    set((state) => {
      state.accessibility.activeAlerts = state.accessibility.activeAlerts.filter(
        alert => alert.id !== id
      )
    })
  },

  // Monitoring control
  toggleAccessibilityMonitoring: () => {
    set((state) => {
      state.accessibility.isMonitoring = !state.accessibility.isMonitoring
      
      get().addNotification({
        type: 'info',
        title: 'Accessibility Monitoring',
        message: state.accessibility.isMonitoring ? 'Enabled' : 'Disabled',
        duration: 2000
      })
    })
  },

  // Color contrast management
  updateColorContrast: (ratio, meetingAA, meetingAAA) => {
    set((state) => {
      state.accessibility.contrast.currentRatio = ratio
      state.accessibility.contrast.meetingAA = meetingAA
      state.accessibility.contrast.meetingAAA = meetingAAA
      
      if (!meetingAA) {
        get().addAccessibilityAlert({
          type: 'warning',
          message: `Color contrast ratio (${ratio.toFixed(2)}) does not meet WCAG AA requirements`,
          category: 'contrast'
        })
      }
    })
  }
})