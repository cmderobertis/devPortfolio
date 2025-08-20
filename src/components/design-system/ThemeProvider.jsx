import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced Material Design 3 Theme Context
 */
const ThemeContext = createContext();

/**
 * Custom hook to use theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Enhanced Theme Provider with MD3 support
 */
const ThemeProvider = ({ children, defaultTheme = 'auto' }) => {
  // Check system preference and saved theme
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('md3-theme');
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      return savedTheme;
    }
    return defaultTheme;
  };

  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const [themeMode, setThemeMode] = useState(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // Get the actual theme to apply (resolve 'auto' to system preference)
  const actualTheme = themeMode === 'auto' ? systemTheme : themeMode;

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        setSystemTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme);
    
    // Also set body class for legacy support
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(`theme-${actualTheme}`);
    
    // Save theme preference
    localStorage.setItem('md3-theme', themeMode);
  }, [themeMode, actualTheme]);

  // Theme switching functions
  const setTheme = (newTheme) => {
    if (['light', 'dark', 'auto'].includes(newTheme)) {
      setThemeMode(newTheme);
    }
  };

  const toggleTheme = () => {
    const nextTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const contextValue = {
    // Current theme state
    theme: actualTheme,
    themeMode,
    systemTheme,
    
    // Theme controls
    setTheme,
    toggleTheme,
    
    // Convenience checks
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',
    isAuto: themeMode === 'auto',
    
    // Theme utilities
    getThemeValue: (lightValue, darkValue) => 
      actualTheme === 'dark' ? darkValue : lightValue,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTheme: PropTypes.oneOf(['light', 'dark', 'auto']),
};

/**
 * Theme Toggle Button Component
 */
export const ThemeToggle = ({ className = '', ...props }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      type="button"
      className={`md3-theme-toggle ${className}`}
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      {...props}
    >
      {theme === 'light' ? (
        <span className="md3-theme-toggle__icon">🌙</span>
      ) : (
        <span className="md3-theme-toggle__icon">☀️</span>
      )}
      <span className="md3-theme-toggle__text">
        {theme === 'light' ? 'Dark' : 'Light'} mode
      </span>
    </button>
  );
};

ThemeToggle.propTypes = {
  className: PropTypes.string,
};

export default ThemeProvider;