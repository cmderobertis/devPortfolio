/**
 * Theme Context for Database Editor
 * Provides centralized theme management and design token access
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { designTokens, getDataTypeColor, getStatusColor, getConfidenceColor } from '../styles/tokens.js';

/**
 * Theme context value type
 */
const ThemeContext = createContext({
  theme: 'light',
  tokens: designTokens,
  toggleTheme: () => {},
  setTheme: () => {},
  getDataTypeColor,
  getStatusColor,
  getConfidenceColor,
  isDark: false
});

/**
 * Theme Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.defaultTheme - Default theme ('light' | 'dark')
 * @param {boolean} props.enableSystemTheme - Whether to respect system theme preference
 */
export function ThemeProvider({ 
  children, 
  defaultTheme = 'light', 
  enableSystemTheme = true 
}) {
  // Theme state
  const [theme, setThemeState] = useState(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('db-editor-theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }

    // Check system preference if enabled
    if (enableSystemTheme && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    return defaultTheme;
  });

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if no theme is explicitly saved
      const savedTheme = localStorage.getItem('db-editor-theme');
      if (!savedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystemTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('db-dark');
      root.classList.remove('db-light');
    } else {
      root.classList.add('db-light');
      root.classList.remove('db-dark');
    }

    // Update CSS custom properties for theme-specific colors
    if (theme === 'dark') {
      root.style.setProperty('--color-background', '#0f172a');
      root.style.setProperty('--color-surface', '#1e293b');
      root.style.setProperty('--color-elevated', '#334155');
      root.style.setProperty('--color-border', '#475569');
      root.style.setProperty('--color-divider', '#334155');
    } else {
      root.style.setProperty('--color-background', '#ffffff');
      root.style.setProperty('--color-surface', '#ffffff');
      root.style.setProperty('--color-elevated', '#ffffff');
      root.style.setProperty('--color-border', '#e5e7eb');
      root.style.setProperty('--color-divider', '#f3f4f6');
    }
  }, [theme]);

  // Theme management functions
  const setTheme = (newTheme) => {
    if (['light', 'dark'].includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('db-editor-theme', newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Enhanced color helper functions with theme awareness
  const getThemedDataTypeColor = (dataType, variant = 'light') => {
    const adjustedVariant = theme === 'dark' ? 'dark' : variant;
    return getDataTypeColor(dataType, adjustedVariant);
  };

  const getThemedStatusColor = (status, variant = 'light') => {
    const adjustedVariant = theme === 'dark' ? 'dark' : variant;
    return getStatusColor(status, adjustedVariant);
  };

  // Utility functions for getting themed values
  const getColor = (colorPath) => {
    const pathArray = colorPath.split('.');
    let value = designTokens.colors;
    
    for (const key of pathArray) {
      value = value[key];
      if (!value) break;
    }
    
    return value || designTokens.colors.gray[500];
  };

  const getSpacing = (size) => {
    return designTokens.spacing[size] || designTokens.spacing[4];
  };

  const getFontSize = (size) => {
    return designTokens.typography.fontSize[size] || designTokens.typography.fontSize.base;
  };

  const getBorderRadius = (size) => {
    return designTokens.borderRadius[size] || designTokens.borderRadius.base;
  };

  const getShadow = (size) => {
    return designTokens.boxShadow[size] || designTokens.boxShadow.base;
  };

  // Generate CSS-in-JS styles for components
  const createStyles = (styleDefinition) => {
    const processValue = (value) => {
      if (typeof value === 'string') {
        // Replace token references with actual values
        return value.replace(/\$\{(.+?)\}/g, (match, tokenPath) => {
          if (tokenPath.startsWith('colors.')) {
            return getColor(tokenPath.replace('colors.', ''));
          } else if (tokenPath.startsWith('spacing.')) {
            return getSpacing(tokenPath.replace('spacing.', ''));
          } else if (tokenPath.startsWith('fontSize.')) {
            return getFontSize(tokenPath.replace('fontSize.', ''));
          }
          return match;
        });
      }
      return value;
    };

    const processedStyles = {};
    Object.entries(styleDefinition).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        processedStyles[key] = createStyles(value);
      } else {
        processedStyles[key] = processValue(value);
      }
    });

    return processedStyles;
  };

  const contextValue = {
    theme,
    tokens: designTokens,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    
    // Color helpers
    getDataTypeColor: getThemedDataTypeColor,
    getStatusColor: getThemedStatusColor,
    getConfidenceColor,
    getColor,
    
    // Spacing and sizing helpers
    getSpacing,
    getFontSize,
    getBorderRadius,
    getShadow,
    
    // Style utilities
    createStyles,
    
    // Component-specific helpers
    getComponentSize: (component, size) => {
      return designTokens.components[component]?.[size] || size;
    },
    
    // Responsive utilities
    getBreakpoint: (breakpoint) => {
      return designTokens.breakpoints[breakpoint];
    },
    
    // Animation utilities
    getTransition: (duration = 'normal', easing = 'ease') => {
      return `${designTokens.transition.duration[duration]} ${designTokens.transition.easing[easing]}`;
    }
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 * @returns {Object} Theme context value
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Hook for creating responsive styles
 * @param {Object} styles - Responsive style object
 * @returns {Object} Processed styles
 */
export function useResponsiveStyles(styles) {
  const { getBreakpoint, createStyles } = useTheme();
  
  const processResponsiveStyles = (styleObj) => {
    const processedStyles = {};
    
    Object.entries(styleObj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Check if this is a responsive object (has breakpoint keys)
        const hasBreakpoints = Object.keys(value).some(k => 
          ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(k)
        );
        
        if (hasBreakpoints) {
          // Create media queries for responsive values
          Object.entries(value).forEach(([breakpoint, breakpointValue]) => {
            const minWidth = getBreakpoint(breakpoint);
            if (minWidth) {
              processedStyles[`@media (min-width: ${minWidth})`] = {
                ...processedStyles[`@media (min-width: ${minWidth})`],
                [key]: breakpointValue
              };
            } else {
              // Base value (no media query)
              processedStyles[key] = breakpointValue;
            }
          });
        } else {
          processedStyles[key] = processResponsiveStyles(value);
        }
      } else {
        processedStyles[key] = value;
      }
    });
    
    return processedStyles;
  };
  
  return createStyles(processResponsiveStyles(styles));
}

/**
 * Hook for data type styling
 * @param {string} dataType - Data type name
 * @returns {Object} Styling object for data type
 */
export function useDataTypeStyles(dataType) {
  const { getDataTypeColor } = useTheme();
  
  return {
    color: getDataTypeColor(dataType, 'light'),
    backgroundColor: getDataTypeColor(dataType, 'bg'),
    borderColor: getDataTypeColor(dataType, 'light'),
    // Additional computed styles
    '--type-color': getDataTypeColor(dataType, 'light'),
    '--type-bg': getDataTypeColor(dataType, 'bg'),
    '--type-text': getDataTypeColor(dataType, 'text')
  };
}

export default ThemeContext;