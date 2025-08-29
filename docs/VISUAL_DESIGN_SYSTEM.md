# Visual Design System Documentation

## Overview

This document provides comprehensive documentation for the Material Design 3-based visual design system implemented in the React portfolio project. The system demonstrates sophisticated theme management, responsive design patterns, and accessibility-first component design following Google's Material Design 3 specifications.

## Table of Contents

1. [Material Design 3 Implementation](#material-design-3-implementation)
2. [Design Tokens System](#design-tokens-system)
3. [Theme System Architecture](#theme-system-architecture)
4. [Color Palette Management](#color-palette-management)
5. [Typography System](#typography-system)
6. [Component Styling Standards](#component-styling-standards)
7. [Responsive Design Patterns](#responsive-design-patterns)
8. [Theme Variants](#theme-variants)
9. [Accessibility Standards](#accessibility-standards)
10. [Implementation Guidelines](#implementation-guidelines)

---

## Material Design 3 Implementation

### Design Philosophy

The portfolio implements Google's Material Design 3 (Material You) design system, emphasizing:

- **Dynamic Color**: Adaptive color schemes based on user preferences and content
- **Expressive Typography**: Enhanced type system with better readability and hierarchy
- **Evolved Components**: Updated component designs with improved usability
- **Personal Expression**: Support for customization and personal branding
- **Accessibility First**: WCAG 2.1 AA compliance built into the foundation

### Core Principles Applied

#### **1. Dynamic Color System**
```css
/* CSS Custom Properties for Material Design 3 */
:root {
  /* Primary Color Palette */
  --md-sys-color-primary: #1976d2;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #bbdefb;
  --md-sys-color-on-primary-container: #0d47a1;
  
  /* Surface Colors */
  --md-sys-color-surface: #ffffff;
  --md-sys-color-on-surface: #1c1b1f;
  --md-sys-color-surface-variant: #f3f3f3;
  --md-sys-color-on-surface-variant: #49454f;
  
  /* Background */
  --md-sys-color-background: #fffbfe;
  --md-sys-color-on-background: #1c1b1f;
}

/* Dark Theme Variants */
[data-theme="dark"] {
  --md-sys-color-primary: #90caf9;
  --md-sys-color-on-primary: #003c71;
  --md-sys-color-primary-container: #0d47a1;
  --md-sys-color-on-primary-container: #bbdefb;
  
  --md-sys-color-surface: #1c1b1f;
  --md-sys-color-on-surface: #e6e1e5;
  --md-sys-color-surface-variant: #49454f;
  --md-sys-color-on-surface-variant: #cac4d0;
  
  --md-sys-color-background: #141218;
  --md-sys-color-on-background: #e6e1e5;
}
```

#### **2. Enhanced Typography Scale**
```css
/* Material Design 3 Typography Scale */
:root {
  /* Display Typography */
  --md-sys-typescale-display-large-font-size: 57px;
  --md-sys-typescale-display-large-line-height: 64px;
  --md-sys-typescale-display-large-font-weight: 400;
  --md-sys-typescale-display-large-letter-spacing: -0.25px;
  
  --md-sys-typescale-display-medium-font-size: 45px;
  --md-sys-typescale-display-medium-line-height: 52px;
  --md-sys-typescale-display-medium-font-weight: 400;
  --md-sys-typescale-display-medium-letter-spacing: 0px;
  
  --md-sys-typescale-display-small-font-size: 36px;
  --md-sys-typescale-display-small-line-height: 44px;
  --md-sys-typescale-display-small-font-weight: 400;
  --md-sys-typescale-display-small-letter-spacing: 0px;
  
  /* Headline Typography */
  --md-sys-typescale-headline-large-font-size: 32px;
  --md-sys-typescale-headline-large-line-height: 40px;
  --md-sys-typescale-headline-large-font-weight: 400;
  --md-sys-typescale-headline-large-letter-spacing: 0px;
  
  --md-sys-typescale-headline-medium-font-size: 28px;
  --md-sys-typescale-headline-medium-line-height: 36px;
  --md-sys-typescale-headline-medium-font-weight: 400;
  --md-sys-typescale-headline-medium-letter-spacing: 0px;
  
  --md-sys-typescale-headline-small-font-size: 24px;
  --md-sys-typescale-headline-small-line-height: 32px;
  --md-sys-typescale-headline-small-font-weight: 400;
  --md-sys-typescale-headline-small-letter-spacing: 0px;
  
  /* Title Typography */
  --md-sys-typescale-title-large-font-size: 22px;
  --md-sys-typescale-title-large-line-height: 28px;
  --md-sys-typescale-title-large-font-weight: 400;
  --md-sys-typescale-title-large-letter-spacing: 0px;
  
  --md-sys-typescale-title-medium-font-size: 16px;
  --md-sys-typescale-title-medium-line-height: 24px;
  --md-sys-typescale-title-medium-font-weight: 500;
  --md-sys-typescale-title-medium-letter-spacing: 0.15px;
  
  --md-sys-typescale-title-small-font-size: 14px;
  --md-sys-typescale-title-small-line-height: 20px;
  --md-sys-typescale-title-small-font-weight: 500;
  --md-sys-typescale-title-small-letter-spacing: 0.1px;
  
  /* Label Typography */
  --md-sys-typescale-label-large-font-size: 14px;
  --md-sys-typescale-label-large-line-height: 20px;
  --md-sys-typescale-label-large-font-weight: 500;
  --md-sys-typescale-label-large-letter-spacing: 0.1px;
  
  --md-sys-typescale-label-medium-font-size: 12px;
  --md-sys-typescale-label-medium-line-height: 16px;
  --md-sys-typescale-label-medium-font-weight: 500;
  --md-sys-typescale-label-medium-letter-spacing: 0.5px;
  
  --md-sys-typescale-label-small-font-size: 11px;
  --md-sys-typescale-label-small-line-height: 16px;
  --md-sys-typescale-label-small-font-weight: 500;
  --md-sys-typescale-label-small-letter-spacing: 0.5px;
  
  /* Body Typography */
  --md-sys-typescale-body-large-font-size: 16px;
  --md-sys-typescale-body-large-line-height: 24px;
  --md-sys-typescale-body-large-font-weight: 400;
  --md-sys-typescale-body-large-letter-spacing: 0.5px;
  
  --md-sys-typescale-body-medium-font-size: 14px;
  --md-sys-typescale-body-medium-line-height: 20px;
  --md-sys-typescale-body-medium-font-weight: 400;
  --md-sys-typescale-body-medium-letter-spacing: 0.25px;
  
  --md-sys-typescale-body-small-font-size: 12px;
  --md-sys-typescale-body-small-line-height: 16px;
  --md-sys-typescale-body-small-font-weight: 400;
  --md-sys-typescale-body-small-letter-spacing: 0.4px;
}
```

#### **3. Shape and Elevation System**
```css
/* Material Design 3 Shape System */
:root {
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
}

/* Elevation System with Box Shadows */
:root {
  --md-sys-elevation-level0: none;
  --md-sys-elevation-level1: 0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24);
  --md-sys-elevation-level2: 0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23);
  --md-sys-elevation-level3: 0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23);
  --md-sys-elevation-level4: 0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22);
  --md-sys-elevation-level5: 0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22);
}
```

---

## Design Tokens System

### Token Categories

The design system uses a comprehensive token system organized into logical categories:

#### **Color Tokens**
```javascript
// src/config/colorPalettes.js - Design Token Structure
export const DESIGN_TOKENS = {
  colors: {
    // Primary Palette
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff'
    },
    
    // Secondary Palette  
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff'
    },
    
    // Surface Colors
    surface: {
      main: '#ffffff',
      variant: '#f3f3f3',
      inverse: '#1c1b1f',
      contrastText: '#1c1b1f'
    },
    
    // Semantic Colors
    semantic: {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3'
    }
  },
  
  spacing: {
    // 8px base unit system
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '905px',
    lg: '1240px',
    xl: '1440px'
  },
  
  transitions: {
    duration: {
      shortest: '150ms',
      shorter: '200ms',
      short: '250ms',
      standard: '300ms',
      complex: '375ms',
      enteringScreen: '225ms',
      leavingScreen: '195ms'
    },
    
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    }
  }
};
```

#### **Spacing System**
```css
/* 8px Grid System - Material Design 3 Spacing */
:root {
  --md-sys-spacing-0: 0px;
  --md-sys-spacing-1: 4px;   /* 0.5 unit */
  --md-sys-spacing-2: 8px;   /* 1 unit - base */
  --md-sys-spacing-3: 12px;  /* 1.5 units */
  --md-sys-spacing-4: 16px;  /* 2 units */
  --md-sys-spacing-5: 20px;  /* 2.5 units */
  --md-sys-spacing-6: 24px;  /* 3 units */
  --md-sys-spacing-8: 32px;  /* 4 units */
  --md-sys-spacing-10: 40px; /* 5 units */
  --md-sys-spacing-12: 48px; /* 6 units */
  --md-sys-spacing-16: 64px; /* 8 units */
  --md-sys-spacing-20: 80px; /* 10 units */
}
```

#### **Motion System**
```css
/* Material Design 3 Motion System */
:root {
  /* Duration Tokens */
  --md-sys-motion-duration-short1: 50ms;
  --md-sys-motion-duration-short2: 100ms;
  --md-sys-motion-duration-short3: 150ms;
  --md-sys-motion-duration-short4: 200ms;
  --md-sys-motion-duration-medium1: 250ms;
  --md-sys-motion-duration-medium2: 300ms;
  --md-sys-motion-duration-medium3: 350ms;
  --md-sys-motion-duration-medium4: 400ms;
  --md-sys-motion-duration-long1: 450ms;
  --md-sys-motion-duration-long2: 500ms;
  --md-sys-motion-duration-long3: 550ms;
  --md-sys-motion-duration-long4: 600ms;
  
  /* Easing Tokens */
  --md-sys-motion-easing-linear: cubic-bezier(0, 0, 1, 1);
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0, 1, 1);
  --md-sys-motion-easing-standard-decelerate: cubic-bezier(0, 0, 0, 1);
  --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
}
```

---

## Theme System Architecture

### Advanced Theme Context Implementation

The portfolio implements a sophisticated theme system that goes beyond basic light/dark switching:

#### **Multi-Modal Theme Support**
```javascript
// Theme Mode Hierarchy
export const THEME_MODES = {
  LIGHT: 'light',      // Explicit light mode
  DARK: 'dark',        // Explicit dark mode  
  AUTO: 'auto'         // Follow system preference
};

// Theme Resolution Logic
const resolvedTheme = mode === THEME_MODES.AUTO 
  ? (systemPrefersDark ? THEME_MODES.DARK : THEME_MODES.LIGHT)
  : mode;
```

#### **Color Palette Management**
```javascript
// Advanced Color Palette System
export const COLOR_PALETTES = {
  light: {
    default: {
      name: 'Material Blue',
      description: 'Google Material Design standard blue palette',
      colors: {
        primary: '#1976d2',
        primaryVariant: '#1565c0',
        secondary: '#dc004e',
        background: '#ffffff',
        surface: '#ffffff',
        error: '#b00020',
        onPrimary: '#ffffff',
        onSecondary: '#ffffff',
        onBackground: '#000000',
        onSurface: '#000000',
        onError: '#ffffff'
      }
    },
    
    nature: {
      name: 'Forest Green',
      description: 'Nature-inspired green palette for environmental themes',
      colors: {
        primary: '#4caf50',
        primaryVariant: '#388e3c',
        secondary: '#ff9800',
        background: '#fafafa',
        surface: '#ffffff',
        error: '#f44336'
      }
    },
    
    ocean: {
      name: 'Deep Ocean',
      description: 'Ocean-inspired blue-teal palette',
      colors: {
        primary: '#006064',
        primaryVariant: '#004d40',
        secondary: '#00acc1',
        background: '#f0f8ff',
        surface: '#ffffff',
        error: '#d32f2f'
      }
    }
  },
  
  dark: {
    default: {
      name: 'Dark Material',
      description: 'Material Design dark theme with enhanced contrast',
      colors: {
        primary: '#90caf9',
        primaryVariant: '#42a5f5',
        secondary: '#f48fb1',
        background: '#121212',
        surface: '#1e1e1e',
        error: '#cf6679',
        onPrimary: '#000000',
        onSecondary: '#000000',
        onBackground: '#ffffff',
        onSurface: '#ffffff',
        onError: '#000000'
      }
    }
    // ... additional dark palettes
  }
};
```

#### **Hue-Based Palette Mapping**
```javascript
// Intelligent palette mapping between light and dark modes
export const LIGHT_DARK_MAPPINGS = {
  'default': 'default',
  'nature': 'forest-dark',
  'ocean': 'deep-ocean-dark',
  'sunset': 'midnight',
  'lavender': 'purple-night'
};

// Function to map palettes when switching themes
export const getMappedScheme = (currentTheme, currentScheme, targetTheme) => {
  if (currentTheme === targetTheme) return currentScheme;
  
  const mappings = currentTheme === 'light' ? LIGHT_DARK_MAPPINGS : DARK_LIGHT_MAPPINGS;
  return mappings[currentScheme] || 'default';
};
```

### Theme Application Process

#### **CSS Custom Property Injection**
```javascript
// Dynamic CSS custom property management
const applyThemeToDOM = (theme, palette) => {
  const paletteVars = getPaletteVariables(theme, palette);
  
  // Apply color variables
  Object.entries(paletteVars).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
  
  // Set theme attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update color scheme for browser integration
  document.documentElement.style.colorScheme = theme;
  
  // Add theme class to body for compatibility
  document.body.classList.remove('light-theme', 'dark-theme');
  document.body.classList.add(`${theme}-theme`);
};
```

#### **System Preference Detection**
```javascript
// Advanced system preference monitoring
useEffect(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return;

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  const handleSystemThemeChange = (e) => {
    setSystemPrefersDark(e.matches);
    
    // Announce system change for accessibility
    if (mode === THEME_MODES.AUTO) {
      announceToScreenReader(
        `System theme changed to ${e.matches ? 'dark' : 'light'} mode`
      );
    }
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
}, [mode]);
```

---

## Color Palette Management

### Color Scheme Categories

The system organizes color palettes into logical categories for better user experience:

```javascript
export const COLOR_SCHEME_CATEGORIES = {
  nature: {
    displayName: 'Nature',
    description: 'Earth-tones and natural color palettes',
    icon: '🌿'
  },
  
  vibrant: {
    displayName: 'Vibrant',
    description: 'Bold, energetic color combinations',
    icon: '🎨'
  },
  
  monochrome: {
    displayName: 'Monochrome',
    description: 'Grayscale and single-hue palettes',
    icon: '⚫'
  },
  
  pastel: {
    displayName: 'Pastel',
    description: 'Soft, muted color palettes',
    icon: '🎀'
  },
  
  professional: {
    displayName: 'Professional',
    description: 'Business-appropriate color schemes',
    icon: '💼'
  }
};
```

### Color Accessibility Compliance

All color combinations are validated for WCAG 2.1 AA compliance:

```javascript
// Color contrast validation
const validateColorContrast = (foreground, background) => {
  const contrast = calculateContrastRatio(foreground, background);
  
  return {
    AAA: contrast >= 7,      // AAA compliance (7:1)
    AA: contrast >= 4.5,     // AA compliance (4.5:1)  
    AALarge: contrast >= 3,  // AA Large text (3:1)
    contrast: contrast.toFixed(2)
  };
};

// Color combination validation for all palette colors
export const COLOR_SCHEME_METADATA = {
  default: {
    accessibility: {
      primaryOnBackground: validateColorContrast('#1976d2', '#ffffff'),
      secondaryOnSurface: validateColorContrast('#dc004e', '#ffffff'),
      textOnSurface: validateColorContrast('#000000', '#ffffff')
    },
    usage: {
      primary: 'Main interactive elements, primary buttons, key navigation',
      secondary: 'Secondary actions, accent elements, highlights',
      surface: 'Card backgrounds, modal overlays, content containers'
    }
  }
};
```

---

## Typography System

### Material Design 3 Type Scale Implementation

```css
/* Typography Component Classes */
.md3-typography {
  margin: 0;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.md3-typography--display-large {
  font-size: var(--md-sys-typescale-display-large-font-size);
  line-height: var(--md-sys-typescale-display-large-line-height);
  font-weight: var(--md-sys-typescale-display-large-font-weight);
  letter-spacing: var(--md-sys-typescale-display-large-letter-spacing);
}

.md3-typography--headline-medium {
  font-size: var(--md-sys-typescale-headline-medium-font-size);
  line-height: var(--md-sys-typescale-headline-medium-line-height);
  font-weight: var(--md-sys-typescale-headline-medium-font-weight);
  letter-spacing: var(--md-sys-typescale-headline-medium-letter-spacing);
}

.md3-typography--body-large {
  font-size: var(--md-sys-typescale-body-large-font-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  font-weight: var(--md-sys-typescale-body-large-font-weight);
  letter-spacing: var(--md-sys-typescale-body-large-letter-spacing);
}

.md3-typography--label-medium {
  font-size: var(--md-sys-typescale-label-medium-font-size);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  font-weight: var(--md-sys-typescale-label-medium-font-weight);
  letter-spacing: var(--md-sys-typescale-label-medium-letter-spacing);
  text-transform: uppercase;
}
```

### Typography Component Usage

```jsx
// Typography Component Implementation
export const Typography = ({ 
  variant = 'body-medium', 
  color = 'on-surface', 
  component: Component = 'p',
  className,
  children,
  ...props 
}) => {
  const classes = [
    'md3-typography',
    `md3-typography--${variant}`,
    `md3-typography--color-${color}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

// Usage Examples
<Typography variant="display-large" component="h1">
  Portfolio Title
</Typography>

<Typography variant="headline-medium" color="primary">
  Section Heading
</Typography>

<Typography variant="body-large">
  Paragraph content with proper line height and spacing.
</Typography>

<Typography variant="label-medium" component="span">
  Button Label
</Typography>
```

---

## Component Styling Standards

### Material Design 3 Button Implementation

```css
/* MD3 Button Base Styles */
.md3-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: var(--md-sys-shape-corner-full, 20px);
  font-family: inherit;
  font-size: var(--md-sys-typescale-label-large-font-size);
  font-weight: var(--md-sys-typescale-label-large-font-weight);
  letter-spacing: var(--md-sys-typescale-label-large-letter-spacing);
  line-height: var(--md-sys-typescale-label-large-line-height);
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  transition: all var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard);
  outline: none;
}

/* Button Variants */
.md3-button--filled {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.md3-button--filled:hover {
  background-color: var(--md-sys-color-primary-container);
  box-shadow: var(--md-sys-elevation-level2);
}

.md3-button--filled:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.md3-button--outlined {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
}

.md3-button--outlined:hover {
  background-color: var(--md-sys-color-primary-container);
  border-color: var(--md-sys-color-primary);
}

.md3-button--text {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  padding: 0 12px;
}

.md3-button--text:hover {
  background-color: var(--md-sys-color-primary-container);
}

/* Size Variants */
.md3-button--small {
  height: 32px;
  padding: 0 16px;
  font-size: var(--md-sys-typescale-label-small-font-size);
}

.md3-button--large {
  height: 48px;
  padding: 0 32px;
  font-size: var(--md-sys-typescale-label-large-font-size);
}

/* State Styles */
.md3-button:disabled {
  background-color: rgba(var(--md-sys-color-on-surface-rgb), 0.12);
  color: rgba(var(--md-sys-color-on-surface-rgb), 0.38);
  cursor: not-allowed;
  pointer-events: none;
}

.md3-button--loading {
  pointer-events: none;
}

.md3-button--loading .md3-button__text {
  opacity: 0;
}

/* Ripple Effect */
.md3-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background-color: currentColor;
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  pointer-events: none;
}

.md3-button:hover::before {
  opacity: 0.08;
}

.md3-button:active::before {
  opacity: 0.12;
}
```

### Card Component Styling

```css
/* MD3 Card Implementation */
.md3-card {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  padding: var(--md-sys-spacing-4);
  transition: all var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
  overflow: hidden;
}

/* Card Variants */
.md3-card--elevated {
  box-shadow: var(--md-sys-elevation-level1);
}

.md3-card--elevated:hover {
  box-shadow: var(--md-sys-elevation-level2);
}

.md3-card--filled {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
}

.md3-card--outlined {
  border: 1px solid var(--md-sys-color-outline);
  background-color: var(--md-sys-color-surface);
}

/* Interactive Cards */
.md3-card--interactive {
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard);
}

.md3-card--interactive:hover {
  transform: translateY(-1px);
  box-shadow: var(--md-sys-elevation-level3);
}

.md3-card--interactive:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

/* Card Structure */
.md3-card__header {
  padding: var(--md-sys-spacing-4);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.md3-card__content {
  padding: var(--md-sys-spacing-4);
  flex-grow: 1;
}

.md3-card__footer {
  padding: var(--md-sys-spacing-4);
  border-top: 1px solid var(--md-sys-color-outline-variant);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--md-sys-spacing-2);
}
```

---

## Responsive Design Patterns

### Breakpoint System

```css
/* Material Design 3 Breakpoints */
:root {
  --md-breakpoint-xs: 0px;
  --md-breakpoint-sm: 600px;
  --md-breakpoint-md: 905px;
  --md-breakpoint-lg: 1240px;
  --md-breakpoint-xl: 1440px;
}

/* Responsive Typography */
@media (max-width: 905px) {
  :root {
    /* Scale down typography for smaller screens */
    --md-sys-typescale-display-large-font-size: 48px;
    --md-sys-typescale-display-medium-font-size: 36px;
    --md-sys-typescale-headline-large-font-size: 28px;
  }
}

@media (max-width: 600px) {
  :root {
    /* Further scaling for mobile */
    --md-sys-typescale-display-large-font-size: 36px;
    --md-sys-typescale-display-medium-font-size: 28px;
    --md-sys-typescale-headline-large-font-size: 24px;
  }
}
```

### Container Queries Implementation

```css
/* Modern Container Queries for Component-Level Responsiveness */
.simulation-container {
  container-type: inline-size;
  container-name: simulation;
}

@container simulation (max-width: 768px) {
  .simulation-controls {
    flex-direction: column;
    gap: var(--md-sys-spacing-2);
  }
  
  .simulation-canvas {
    width: 100%;
    height: 300px;
  }
  
  .performance-stats {
    display: none; /* Hide on small containers */
  }
}

@container simulation (min-width: 1200px) {
  .simulation-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--md-sys-spacing-6);
  }
}
```

### Touch-First Design

```css
/* Touch-optimized interactive elements */
.md3-button {
  min-height: 44px; /* Apple/Google recommended minimum touch target */
  min-width: 44px;
}

@media (pointer: coarse) {
  .md3-button {
    min-height: 48px; /* Larger for touch devices */
    padding: 0 24px;
  }
  
  .simulation-canvas {
    touch-action: pan-x pan-y; /* Allow pinch/zoom */
  }
  
  .navbar-nav .nav-link {
    padding: var(--md-sys-spacing-3) var(--md-sys-spacing-4);
  }
}
```

---

## Theme Variants

### Custom Theme Variant System

The design system supports specialized theme variants for different contexts:

```javascript
// Theme Variant Configuration
export const THEME_VARIANTS = {
  default: {
    name: 'Standard Material Design',
    description: 'Google Material Design 3 standard implementation'
  },
  
  minimal: {
    name: 'Minimal Design',
    description: 'Ultra-clean design with reduced visual weight',
    overrides: {
      elevation: 'none',
      borderRadius: '4px',
      animations: 'reduced'
    }
  },
  
  retro: {
    name: 'Retro Computing',
    description: '98.css inspired theme for retro computing aesthetics',
    overrides: {
      fontFamily: 'monospace',
      borderStyle: 'inset',
      colorScheme: 'high-contrast'
    }
  }
};
```

### ThemeVariantProvider Implementation

```jsx
// Theme Variant Context
const ThemeVariantContext = createContext({
  variant: 'default',
  setVariant: () => {},
  getVariantClass: () => ''
});

export const ThemeVariantProvider = ({ variant = 'default', children }) => {
  const [currentVariant, setCurrentVariant] = useState(variant);
  
  const getVariantClass = useCallback((baseClass) => {
    if (currentVariant === 'default') return baseClass;
    return `${baseClass} ${baseClass}--${currentVariant}`;
  }, [currentVariant]);
  
  useEffect(() => {
    document.body.setAttribute('data-theme-variant', currentVariant);
  }, [currentVariant]);
  
  const contextValue = {
    variant: currentVariant,
    setVariant: setCurrentVariant,
    getVariantClass
  };
  
  return (
    <ThemeVariantContext.Provider value={contextValue}>
      {children}
    </ThemeVariantContext.Provider>
  );
};

// Usage in Components
const Button = ({ variant, className, ...props }) => {
  const { getVariantClass } = useThemeVariant();
  
  const classes = [
    getVariantClass('md3-button'),
    `md3-button--${variant}`,
    className
  ].filter(Boolean).join(' ');
  
  return <button className={classes} {...props} />;
};
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

The design system ensures comprehensive accessibility compliance:

#### **Color Contrast Requirements**
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text** (18pt+): 3:1 contrast ratio minimum  
- **Interactive elements**: 3:1 contrast ratio for UI components
- **Focus indicators**: 3:1 contrast ratio against adjacent colors

#### **Focus Management**
```css
/* Focus indicators following Material Design 3 */
.md3-focusable:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
  border-radius: var(--md-sys-shape-corner-small);
}

/* High contrast focus for better visibility */
@media (prefers-contrast: high) {
  .md3-focusable:focus-visible {
    outline-width: 3px;
    outline-color: var(--md-sys-color-on-background);
    background-color: var(--md-sys-color-primary-container);
  }
}
```

#### **Screen Reader Support**
```css
/* Screen reader only content */
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

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  padding: 8px;
  z-index: 1000;
  text-decoration: none;
  border-radius: var(--md-sys-shape-corner-small);
}

.skip-link:focus {
  top: 6px;
}
```

#### **Reduced Motion Support**
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .md3-button,
  .md3-card {
    transition: none;
  }
}
```

---

## Implementation Guidelines

### Component Development Checklist

When creating new components, ensure:

#### **✅ Material Design 3 Compliance**
- [ ] Uses MD3 design tokens (colors, typography, spacing)
- [ ] Implements proper elevation and shadows
- [ ] Follows MD3 component specifications
- [ ] Supports light/dark theme switching

#### **✅ Accessibility Requirements**
- [ ] WCAG 2.1 AA compliant color contrast
- [ ] Proper ARIA labels and roles
- [ ] Keyboard navigation support
- [ ] Focus management and indicators
- [ ] Screen reader announcements

#### **✅ Responsive Design**
- [ ] Works on all breakpoints (xs to xl)
- [ ] Touch-friendly interaction targets
- [ ] Container query support where applicable
- [ ] Reduced motion respect

#### **✅ Performance Optimization**  
- [ ] Minimal re-renders with React.memo
- [ ] Efficient CSS with custom properties
- [ ] GPU-accelerated animations
- [ ] Lazy loading for heavy components

#### **✅ Theme Integration**
- [ ] Uses ThemeContext for theme-aware styling
- [ ] Supports theme variant overrides
- [ ] Proper CSS custom property usage
- [ ] Theme persistence and system preference detection

### CSS Architecture Standards

```css
/* BEM-inspired CSS class naming */
.md3-component {
  /* Base component styles */
}

.md3-component--variant {
  /* Variant modifier styles */
}

.md3-component__element {
  /* Sub-element styles */
}

.md3-component__element--modifier {
  /* Sub-element modifier styles */
}

/* State classes */
.md3-component.is-active,
.md3-component[aria-expanded="true"] {
  /* State-based styling */
}
```

### JavaScript Integration Patterns

```javascript
// Theme-aware component pattern
const ThemeAwareComponent = ({ className, ...props }) => {
  const { resolvedTheme, currentPalette } = useTheme();
  const { getVariantClass } = useThemeVariant();
  
  const classes = [
    getVariantClass('md3-component'),
    `md3-component--${resolvedTheme}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={classes}
      data-theme={resolvedTheme}
      data-palette={currentPalette}
      {...props}
    />
  );
};
```

This comprehensive visual design system documentation provides the foundation for consistent, accessible, and maintainable component development following Material Design 3 principles while supporting advanced theme customization and responsive design patterns.