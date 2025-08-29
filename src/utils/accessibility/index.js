/**
 * Accessibility utilities index
 * Central export for all accessibility-related utilities
 */

export * from './colorContrast.js';

/**
 * ARIA label generators for common UI patterns
 */
export const generateAriaLabel = {
  /**
   * Generate ARIA label for grid cell
   */
  gridCell: (x, y, isActive, additionalInfo = '') => {
    const position = `Row ${y + 1}, Column ${x + 1}`;
    const state = isActive ? 'active' : 'inactive';
    return `${position}, ${state}${additionalInfo ? `, ${additionalInfo}` : ''}`;
  },

  /**
   * Generate ARIA label for simulation controls
   */
  simulationControl: (action, state, additionalInfo = '') => {
    const stateText = state ? `Currently ${state}` : '';
    return `${action}${stateText ? `. ${stateText}` : ''}${additionalInfo ? `. ${additionalInfo}` : ''}`;
  },

  /**
   * Generate ARIA label for navigation items
   */
  navigation: (destination, isActive = false, hasSubItems = false) => {
    const activeText = isActive ? ', current page' : '';
    const subItemsText = hasSubItems ? ', has submenu' : '';
    return `Navigate to ${destination}${activeText}${subItemsText}`;
  },

  /**
   * Generate ARIA label for interactive canvas
   */
  interactiveCanvas: (description, currentState = '', instructions = '') => {
    return `${description}${currentState ? `. ${currentState}` : ''}${instructions ? `. ${instructions}` : ''}`;
  }
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Set focus with proper timing and fallback
   */
  setFocus: (element, options = {}) => {
    if (!element) return false;
    
    const { preventScroll = false, delay = 0 } = options;
    
    const focus = () => {
      try {
        element.focus({ preventScroll });
        return true;
      } catch (error) {
        console.warn('Focus failed:', error);
        return false;
      }
    };
    
    if (delay > 0) {
      setTimeout(focus, delay);
      return true;
    }
    
    return focus();
  },

  /**
   * Trap focus within a container
   */
  trapFocus: (container, options = {}) => {
    if (!container) return null;
    
    const { initialFocus = null, returnFocus = null } = options;
    
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = container.querySelectorAll(focusableSelector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    // Set initial focus
    if (initialFocus) {
      focusManagement.setFocus(initialFocus, { delay: 100 });
    } else if (firstElement) {
      focusManagement.setFocus(firstElement, { delay: 100 });
    }
    
    container.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (returnFocus) {
        focusManagement.setFocus(returnFocus, { delay: 100 });
      }
    };
  },

  /**
   * Find the next focusable element
   */
  findNextFocusable: (currentElement, direction = 'forward') => {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(document.querySelectorAll(focusableSelector));
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) return null;
    
    if (direction === 'forward') {
      return focusableElements[currentIndex + 1] || focusableElements[0];
    } else {
      return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
    }
  }
};

/**
 * Touch target optimization utilities
 */
export const touchTargets = {
  /**
   * Minimum touch target size (44px as per WCAG guidelines)
   */
  MIN_SIZE: 44,

  /**
   * Check if element meets minimum touch target size
   */
  validateSize: (element) => {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.width >= touchTargets.MIN_SIZE && rect.height >= touchTargets.MIN_SIZE;
  },

  /**
   * Audit all interactive elements for touch target compliance
   */
  auditTouchTargets: () => {
    const interactiveSelector = 'button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
    const interactiveElements = document.querySelectorAll(interactiveSelector);
    const violations = [];
    
    interactiveElements.forEach(element => {
      if (!touchTargets.validateSize(element)) {
        violations.push({
          element,
          size: element.getBoundingClientRect(),
          selector: element.id ? `#${element.id}` : element.tagName.toLowerCase()
        });
      }
    });
    
    return violations;
  }
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNavigation = {
  /**
   * Standard key codes for navigation
   */
  KEYS: {
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  },

  /**
   * Check if key is a navigation key
   */
  isNavigationKey: (key) => {
    return Object.values(keyboardNavigation.KEYS).includes(key);
  },

  /**
   * Get next position in grid based on key press
   */
  getNextGridPosition: (currentPos, key, gridSize, options = {}) => {
    const { wrapAround = false } = options;
    const { x, y } = currentPos;
    const { width, height } = gridSize;
    
    switch (key) {
      case keyboardNavigation.KEYS.ARROW_UP:
        return { x, y: wrapAround ? (y > 0 ? y - 1 : height - 1) : Math.max(0, y - 1) };
      case keyboardNavigation.KEYS.ARROW_DOWN:
        return { x, y: wrapAround ? (y < height - 1 ? y + 1 : 0) : Math.min(height - 1, y + 1) };
      case keyboardNavigation.KEYS.ARROW_LEFT:
        return { x: wrapAround ? (x > 0 ? x - 1 : width - 1) : Math.max(0, x - 1), y };
      case keyboardNavigation.KEYS.ARROW_RIGHT:
        return { x: wrapAround ? (x < width - 1 ? x + 1 : 0) : Math.min(width - 1, x + 1), y };
      case keyboardNavigation.KEYS.HOME:
        return { x: 0, y: 0 };
      case keyboardNavigation.KEYS.END:
        return { x: width - 1, y: height - 1 };
      case keyboardNavigation.KEYS.PAGE_UP:
        return { x, y: Math.max(0, y - Math.floor(height / 4)) };
      case keyboardNavigation.KEYS.PAGE_DOWN:
        return { x, y: Math.min(height - 1, y + Math.floor(height / 4)) };
      default:
        return currentPos;
    }
  }
};

/**
 * Live regions for dynamic content announcements
 */
export const liveRegions = {
  /**
   * Create or update a live region
   */
  announce: (message, priority = 'polite', id = 'default') => {
    const regionId = `live-region-${id}`;
    let region = document.getElementById(regionId);
    
    if (!region) {
      region = document.createElement('div');
      region.id = regionId;
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
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
    }
    
    // Clear and set message with slight delay for better screen reader support
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 100);
  },

  /**
   * Remove a live region
   */
  remove: (id = 'default') => {
    const regionId = `live-region-${id}`;
    const region = document.getElementById(regionId);
    if (region) {
      region.remove();
    }
  }
};

/**
 * Complete accessibility audit function
 */
export const performAccessibilityAudit = () => {
  const results = {
    timestamp: new Date().toISOString(),
    colorContrast: [],
    touchTargets: [],
    focusableElements: 0,
    images: [],
    headings: [],
    landmarks: []
  };
  
  // Color contrast audit
  try {
    results.colorContrast = auditPageContrast();
  } catch (error) {
    console.warn('Color contrast audit failed:', error);
  }
  
  // Touch targets audit
  try {
    results.touchTargets = touchTargets.auditTouchTargets();
  } catch (error) {
    console.warn('Touch targets audit failed:', error);
  }
  
  // Count focusable elements
  const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  results.focusableElements = focusableElements.length;
  
  // Check images for alt text
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-hidden')) {
      results.images.push({
        src: img.src,
        issue: 'Missing alt text'
      });
    }
  });
  
  // Check heading structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1));
    if (level > previousLevel + 1) {
      results.headings.push({
        element: heading,
        issue: `Heading level skipped from h${previousLevel} to h${level}`
      });
    }
    previousLevel = level;
  });
  
  // Check for landmarks
  const landmarks = document.querySelectorAll('main, nav, aside, footer, header, [role="main"], [role="navigation"], [role="complementary"], [role="contentinfo"], [role="banner"]');
  results.landmarks = landmarks.length;
  
  return results;
};