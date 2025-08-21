// Material Design 3 Component Library
// Import CSS files for styling
import './Card.css';
import './Button.css';
import './Typography.css';
import './Container.css';
import './ThemeProvider.css';
import './Combobox.css';

// Export all components
export { default as Card, CardHeader, CardContent, CardActions } from './Card';
export { default as Button } from './Button';
export { default as Typography } from './Typography';
export { default as Container, Section, Grid } from './Container';
export { default as ThemeProvider, ThemeToggle, useTheme } from './ThemeProvider';
export { default as Combobox } from './Combobox';

// Component library version
export const VERSION = '1.0.0';

// Design system configuration
export const designTokens = {
  spacing: {
    none: 0,
    xs: 'var(--md-sys-spacing-1)',
    sm: 'var(--md-sys-spacing-2)',
    md: 'var(--md-sys-spacing-4)',
    lg: 'var(--md-sys-spacing-6)',
    xl: 'var(--md-sys-spacing-8)',
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '905px',
    lg: '1240px',
    xl: '1440px',
  },
  elevation: {
    0: 'var(--md-sys-elevation-level0)',
    1: 'var(--md-sys-elevation-level1)',
    2: 'var(--md-sys-elevation-level2)',
    3: 'var(--md-sys-elevation-level3)',
    4: 'var(--md-sys-elevation-level4)',
    5: 'var(--md-sys-elevation-level5)',
  },
  borderRadius: {
    none: 'var(--md-sys-shape-corner-none)',
    xs: 'var(--md-sys-shape-corner-extra-small)',
    sm: 'var(--md-sys-shape-corner-small)',
    md: 'var(--md-sys-shape-corner-medium)',
    lg: 'var(--md-sys-shape-corner-large)',
    xl: 'var(--md-sys-shape-corner-extra-large)',
    full: 'var(--md-sys-shape-corner-full)',
  },
};