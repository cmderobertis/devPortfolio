/**
 * Accessibility Utilities for WCAG 2.1 AA Compliance
 * Phase 2: UX/Accessibility Implementation
 */

// ARIA live region manager for screen reader announcements
class LiveRegionManager {
  constructor() {
    this.regions = new Map();
    this.initializeRegions();
  }

  initializeRegions() {
    // Create polite live region for non-urgent updates
    this.createRegion('polite', 'polite');
    // Create assertive live region for urgent updates
    this.createRegion('assertive', 'assertive');
    // Create status region for status updates
    this.createRegion('status', 'status');
  }

  createRegion(id, politeness) {
    if (typeof document === 'undefined') return;
    
    let region = document.getElementById(`aria-live-${id}`);
    
    if (!region) {
      region = document.createElement('div');
      region.id = `aria-live-${id}`;
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', 'false');
      region.className = 'sr-only';
      region.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      
      document.body.appendChild(region);
      this.regions.set(id, region);
    }
  }

  announce(message, priority = 'polite') {
    const region = this.regions.get(priority);
    if (region && message) {
      // Clear previous message
      region.textContent = '';
      // Set new message with slight delay to ensure screen reader picks it up
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  }

  announceRouteChange(routeName) {
    this.announce(`Navigated to ${routeName} page`, 'polite');
  }

  announceLoadingState(componentName, isLoading) {
    if (isLoading) {
      this.announce(`Loading ${componentName}...`, 'polite');
    } else {
      this.announce(`${componentName} loaded successfully`, 'polite');
    }
  }

  announceError(errorMessage) {
    this.announce(`Error: ${errorMessage}`, 'assertive');
  }

  announceStatus(statusMessage) {
    this.announce(statusMessage, 'status');
  }
}

// Global live region manager instance
export const liveRegionManager = new LiveRegionManager();

// Focus management utilities
export const focusManagement = {
  // Set focus with optional delay and validation
  setFocus(element, options = {}) {
    const { delay = 0, preventScroll = false } = options;
    
    if (!element || typeof element.focus !== 'function') {
      console.warn('Invalid element for focus:', element);
      return;
    }

    const focusElement = () => {
      try {
        element.focus({ preventScroll });
        // Ensure the element is actually focused
        if (document.activeElement !== element) {
          console.warn('Focus may not have been set correctly');
        }
      } catch (error) {
        console.error('Error setting focus:', error);
      }
    };

    if (delay > 0) {
      setTimeout(focusElement, delay);
    } else {
      focusElement();
    }
  },

  // Focus trap for modal dialogs and side panels
  trapFocus(container, options = {}) {
    if (!container) return null;

    const { 
      returnFocus = null, 
      initialFocus = null,
      escapeCallback = null 
    } = options;

    // Get all focusable elements
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'details summary'
    ].join(', ');

    let focusableElements = Array.from(container.querySelectorAll(focusableSelectors));
    focusableElements = focusableElements.filter(el => {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });

    if (focusableElements.length === 0) {
      console.warn('No focusable elements found in container');
      return null;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Set initial focus
    if (initialFocus && focusableElements.includes(initialFocus)) {
      this.setFocus(initialFocus);
    } else {
      this.setFocus(firstFocusable);
    }

    const handleKeyDown = (e) => {
      // Handle Escape key
      if (e.key === 'Escape' && escapeCallback) {
        escapeCallback();
        return;
      }

      // Handle Tab key
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            this.setFocus(lastFocusable);
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            this.setFocus(firstFocusable);
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (returnFocus) {
        this.setFocus(returnFocus, { delay: 100 });
      }
    };
  },

  // Skip to main content functionality
  addSkipToMainLink() {
    if (typeof document === 'undefined') return;
    
    let skipLink = document.getElementById('skip-to-main');
    if (skipLink) return;

    skipLink = document.createElement('a');
    skipLink.id = 'skip-to-main';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 1000000;
      padding: 8px 16px;
      background: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
      skipLink.style.opacity = '1';
      skipLink.style.transform = 'translateY(0)';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
      skipLink.style.opacity = '0';
      skipLink.style.transform = 'translateY(-10px)';
    });

    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content') || document.querySelector('main');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }
};

// ARIA label generators for consistent accessibility
export const generateAriaLabel = {
  button(text, isPressed = null, isExpanded = null) {
    let label = text;
    if (isPressed !== null) {
      label += isPressed ? ', pressed' : ', not pressed';
    }
    if (isExpanded !== null) {
      label += isExpanded ? ', expanded' : ', collapsed';
    }
    return label;
  },

  navigation(linkText, isCurrent = false) {
    return isCurrent ? `${linkText}, current page` : linkText;
  },

  loading(componentName) {
    return `Loading ${componentName}...`;
  },

  error(message) {
    return `Error: ${message}`;
  },

  status(text, isLive = true) {
    return isLive ? `Status: ${text}` : text;
  },

  modal(title) {
    return `${title} dialog`;
  },

  tab(title, isSelected = false, position = null, total = null) {
    let label = title;
    if (isSelected) label += ', selected';
    if (position && total) label += `, ${position} of ${total}`;
    return label;
  },

  progress(current, total, description = '') {
    return `${description} ${current} of ${total}`.trim();
  }
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Arrow key navigation for grids and lists
  setupArrowNavigation(container, options = {}) {
    if (!container) return null;

    const {
      selector = '[role="gridcell"], [role="option"], [role="menuitem"]',
      wrap = false,
      orientation = 'both' // 'horizontal', 'vertical', or 'both'
    } = options;

    const handleKeyDown = (e) => {
      const items = Array.from(container.querySelectorAll(selector));
      const currentIndex = items.indexOf(e.target);
      
      if (currentIndex === -1) return;

      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          if (orientation === 'vertical') return;
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= items.length) {
            newIndex = wrap ? 0 : items.length - 1;
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'vertical') return;
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? items.length - 1 : 0;
          }
          break;

        case 'ArrowDown':
          if (orientation === 'horizontal') return;
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= items.length) {
            newIndex = wrap ? 0 : items.length - 1;
          }
          break;

        case 'ArrowUp':
          if (orientation === 'horizontal') return;
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? items.length - 1 : 0;
          }
          break;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = items.length - 1;
          break;
      }

      if (newIndex !== currentIndex && items[newIndex]) {
        focusManagement.setFocus(items[newIndex]);
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },

  // Escape key handler
  setupEscapeHandler(callback) {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        callback(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }
};

// Touch target optimization for mobile
export const touchOptimization = {
  // Minimum touch target size (44px x 44px per WCAG)
  MINIMUM_TOUCH_SIZE: 44,

  // Check if touch targets meet minimum size requirements
  validateTouchTargets(container = document.body) {
    const interactiveSelectors = 'button, a, input, select, textarea, [role="button"], [tabindex]';
    const elements = container.querySelectorAll(interactiveSelectors);
    const issues = [];

    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (rect.width < this.MINIMUM_TOUCH_SIZE || rect.height < this.MINIMUM_TOUCH_SIZE) {
          issues.push({
            element,
            size: { width: rect.width, height: rect.height },
            recommendation: `Increase size to at least ${this.MINIMUM_TOUCH_SIZE}px`
          });
        }
      }
    });

    return issues;
  },

  // Add spacing between touch targets
  ensureTouchTargetSpacing(container = document.body) {
    const style = document.createElement('style');
    style.textContent = `
      .touch-target-optimized {
        min-height: ${this.MINIMUM_TOUCH_SIZE}px;
        min-width: ${this.MINIMUM_TOUCH_SIZE}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 2px;
      }
    `;
    
    if (!document.head.querySelector('#touch-optimization-styles')) {
      style.id = 'touch-optimization-styles';
      document.head.appendChild(style);
    }
  }
};

// High contrast and reduced motion support
export const preferences = {
  // Check user preferences
  checkReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  checkHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  checkColorScheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  // Apply accessibility preferences
  applyAccessibilityPreferences() {
    const root = document.documentElement;
    
    if (this.checkReducedMotion()) {
      root.style.setProperty('--motion-duration', '0.01ms');
      root.classList.add('reduce-motion');
    }

    if (this.checkHighContrast()) {
      root.classList.add('high-contrast');
    }

    // Listen for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        root.style.setProperty('--motion-duration', '0.01ms');
        root.classList.add('reduce-motion');
      } else {
        root.style.removeProperty('--motion-duration');
        root.classList.remove('reduce-motion');
      }
    });

    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
    });
  }
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  // Add skip link
  focusManagement.addSkipToMainLink();
  
  // Apply user preferences
  preferences.applyAccessibilityPreferences();
  
  // Ensure touch target optimization
  touchOptimization.ensureTouchTargetSpacing();
  
  // Initialize live regions
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      liveRegionManager.initializeRegions();
    });
  }
};

// Export for easy import
export default {
  liveRegionManager,
  focusManagement,
  generateAriaLabel,
  keyboardNavigation,
  touchOptimization,
  preferences,
  initializeAccessibility
};