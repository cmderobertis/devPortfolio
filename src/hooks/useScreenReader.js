import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for screen reader announcements
 * Provides WCAG 2.1 AA compliant screen reader support
 */
const useScreenReader = () => {
  const announcerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Create or get the screen reader announcer element
  const getAnnouncer = useCallback(() => {
    if (announcerRef.current) {
      return announcerRef.current;
    }

    // Look for existing announcer
    let announcer = document.getElementById('sr-announcer');
    
    if (!announcer) {
      // Create new announcer
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
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
      document.body.appendChild(announcer);
    }

    announcerRef.current = announcer;
    return announcer;
  }, []);

  // Announce message to screen readers
  const announce = useCallback((message, priority = 'polite', delay = 100) => {
    if (!message || typeof message !== 'string') return;

    const announcer = getAnnouncer();
    
    // Clear any pending announcements
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update aria-live attribute based on priority
    if (priority === 'assertive' || priority === 'alert') {
      announcer.setAttribute('aria-live', 'assertive');
    } else {
      announcer.setAttribute('aria-live', 'polite');
    }

    // Clear current content first, then add new message after a brief delay
    announcer.textContent = '';
    
    timeoutRef.current = setTimeout(() => {
      announcer.textContent = message;
      
      // Clear the message after a reasonable time to avoid clutter
      setTimeout(() => {
        if (announcer.textContent === message) {
          announcer.textContent = '';
        }
      }, 3000);
    }, delay);
  }, [getAnnouncer]);

  // Announce with assertive priority (interrupts current speech)
  const announceAssertive = useCallback((message, delay = 100) => {
    announce(message, 'assertive', delay);
  }, [announce]);

  // Announce status updates (polite priority)
  const announceStatus = useCallback((message, delay = 100) => {
    announce(message, 'polite', delay);
  }, [announce]);

  // Announce errors or alerts (assertive priority)
  const announceAlert = useCallback((message, delay = 0) => {
    announce(message, 'assertive', delay);
  }, [announce]);

  // Announce navigation changes
  const announceNavigation = useCallback((destination, additionalInfo = '') => {
    const message = additionalInfo 
      ? `Navigated to ${destination}. ${additionalInfo}`
      : `Navigated to ${destination}`;
    announceStatus(message);
  }, [announceStatus]);

  // Announce simulation state changes
  const announceSimulationState = useCallback((state, details = '') => {
    const message = details 
      ? `Simulation ${state}. ${details}`
      : `Simulation ${state}`;
    announceStatus(message);
  }, [announceStatus]);

  // Announce grid position changes for navigation
  const announceGridPosition = useCallback((x, y, cellInfo = '') => {
    const message = cellInfo 
      ? `Position ${x + 1}, ${y + 1}. ${cellInfo}`
      : `Position ${x + 1}, ${y + 1}`;
    announce(message, 'polite', 50); // Shorter delay for navigation
  }, [announce]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    announce,
    announceAssertive,
    announceStatus,
    announceAlert,
    announceNavigation,
    announceSimulationState,
    announceGridPosition
  };
};

export default useScreenReader;