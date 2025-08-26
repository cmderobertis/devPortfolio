import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { COLOR_PALETTES, DEFAULT_PALETTES, getPaletteVariables } from "../config/colorPalettes";

// Available theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Create the theme context with enhanced functionality
export const ThemeContext = createContext({
  // Current theme mode
  mode: THEME_MODES.AUTO,
  // Resolved theme (light or dark)
  resolvedTheme: THEME_MODES.LIGHT,
  // Is system preference dark?
  systemPrefersDark: false,
  // Color palette management
  lightPalette: DEFAULT_PALETTES.light,
  darkPalette: DEFAULT_PALETTES.dark,
  currentPalette: DEFAULT_PALETTES.light,
  availablePalettes: COLOR_PALETTES,
  // Theme manipulation functions
  setMode: () => {},
  toggleTheme: () => {},
  setLightPalette: () => {},
  setDarkPalette: () => {},
  // Utility functions
  isDark: false,
  isLight: true,
  isAuto: true
});

// Enhanced theme provider component with MD3 integration
export const ThemeProvider = ({ children }) => {
  // State for theme mode and system preference
  const [mode, setMode] = useState(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem("theme-mode");
    if (savedMode && Object.values(THEME_MODES).includes(savedMode)) {
      return savedMode;
    }
    return THEME_MODES.AUTO; // Default to auto mode
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // State for color palettes
  const [lightPalette, setLightPalette] = useState(() => {
    const saved = localStorage.getItem("theme-light-palette");
    return (saved && COLOR_PALETTES.light[saved]) ? saved : DEFAULT_PALETTES.light;
  });

  const [darkPalette, setDarkPalette] = useState(() => {
    const saved = localStorage.getItem("theme-dark-palette");
    return (saved && COLOR_PALETTES.dark[saved]) ? saved : DEFAULT_PALETTES.dark;
  });

  // Calculate resolved theme based on mode and system preference
  const resolvedTheme = mode === THEME_MODES.AUTO 
    ? (systemPrefersDark ? THEME_MODES.DARK : THEME_MODES.LIGHT)
    : mode;

  // Get current palette based on resolved theme
  const currentPalette = resolvedTheme === THEME_MODES.DARK ? darkPalette : lightPalette;

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = (e) => {
      setSystemPrefersDark(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  // Enhanced toggle function that cycles through modes
  const toggleTheme = useCallback(() => {
    const modes = Object.values(THEME_MODES);
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    setMode(nextMode);
  }, [mode]);

  // Set specific theme mode
  const setThemeMode = useCallback((newMode) => {
    if (Object.values(THEME_MODES).includes(newMode)) {
      setMode(newMode);
    }
  }, []);

  // Set palette functions
  const setLightPaletteFunc = useCallback((paletteKey) => {
    if (COLOR_PALETTES.light[paletteKey]) {
      setLightPalette(paletteKey);
      localStorage.setItem("theme-light-palette", paletteKey);
    }
  }, []);

  const setDarkPaletteFunc = useCallback((paletteKey) => {
    if (COLOR_PALETTES.dark[paletteKey]) {
      setDarkPalette(paletteKey);
      localStorage.setItem("theme-dark-palette", paletteKey);
    }
  }, []);

  // Apply theme to DOM whenever resolved theme or palette changes
  useEffect(() => {
    // Save mode preference
    localStorage.setItem("theme-mode", mode);
    
    // Apply data-theme attribute for CSS
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    
    // Add theme class to body for compatibility
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${resolvedTheme}-theme`);
    
    // Set color-scheme for better browser integration
    document.documentElement.style.colorScheme = resolvedTheme;

    // Apply current palette colors as CSS custom properties
    const paletteVars = getPaletteVariables(resolvedTheme, currentPalette);
    Object.entries(paletteVars).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    
    // Announce theme change to screen readers
    const paletteName = COLOR_PALETTES[resolvedTheme][currentPalette]?.name || currentPalette;
    const announcement = `Theme changed to ${resolvedTheme} mode with ${paletteName} palette`;
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    
    // Clean up announcer after announcement
    setTimeout(() => {
      if (announcer.parentNode) {
        announcer.parentNode.removeChild(announcer);
      }
    }, 1000);
  }, [mode, resolvedTheme, currentPalette]);

  // Calculate utility flags
  const isDark = resolvedTheme === THEME_MODES.DARK;
  const isLight = resolvedTheme === THEME_MODES.LIGHT;
  const isAuto = mode === THEME_MODES.AUTO;

  // Context value with enhanced functionality
  const contextValue = {
    mode,
    resolvedTheme,
    systemPrefersDark,
    lightPalette,
    darkPalette,
    currentPalette,
    availablePalettes: COLOR_PALETTES,
    setMode: setThemeMode,
    toggleTheme,
    setLightPalette: setLightPaletteFunc,
    setDarkPalette: setDarkPaletteFunc,
    isDark,
    isLight,
    isAuto,
    // Legacy compatibility
    theme: resolvedTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easier theme access
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Screen reader only styles for accessibility announcements
const srOnlyStyles = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

// Inject SR-only styles if they don't exist
if (typeof document !== 'undefined' && !document.getElementById('sr-only-styles')) {
  const style = document.createElement('style');
  style.id = 'sr-only-styles';
  style.textContent = srOnlyStyles;
  document.head.appendChild(style);
}
