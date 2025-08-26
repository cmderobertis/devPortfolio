// Utility functions for interactive module layouts

/**
 * Get the current header height from CSS custom property
 * @returns {number} Header height in pixels
 */
export const getHeaderHeight = () => {
  return parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--interactive-header-height') || '88px'
  );
};

/**
 * Calculate available viewport dimensions for interactive modules
 * @param {boolean} hasRightSidebar - Whether there's a right sidebar
 * @param {number} sidebarWidth - Width of the sidebar in pixels
 * @returns {Object} Available width and height
 */
export const getAvailableDimensions = (hasRightSidebar = false, sidebarWidth = 320) => {
  const headerHeight = getHeaderHeight();
  const availableWidth = window.innerWidth - (hasRightSidebar ? sidebarWidth : 0);
  const availableHeight = window.innerHeight - headerHeight;
  
  return {
    width: availableWidth,
    height: availableHeight,
    headerHeight
  };
};

/**
 * Set up responsive canvas sizing for interactive modules
 * @param {HTMLCanvasElement} canvas - Canvas element to resize
 * @param {boolean} hasRightSidebar - Whether there's a right sidebar
 * @param {number} sidebarWidth - Width of the sidebar in pixels
 * @returns {Object} Canvas dimensions
 */
export const resizeCanvas = (canvas, hasRightSidebar = false, sidebarWidth = 320) => {
  if (!canvas) return { width: 0, height: 0 };
  
  const { width, height } = getAvailableDimensions(hasRightSidebar, sidebarWidth);
  
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  
  return { width, height };
};