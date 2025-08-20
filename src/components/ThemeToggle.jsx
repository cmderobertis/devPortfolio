import React from 'react';
import { useTheme, THEME_MODES } from '../context/ThemeContext';
import './ThemeToggle.css';

// Theme toggle component with accessibility and MD3 design
export const ThemeToggle = ({ variant = 'default', size = 'medium', className = '' }) => {
  const { mode, resolvedTheme, toggleTheme, isDark, isAuto } = useTheme();

  // Get appropriate icon and label for current mode
  const getThemeInfo = () => {
    switch (mode) {
      case THEME_MODES.LIGHT:
        return {
          icon: 'fas fa-sun',
          label: 'Light mode',
          nextLabel: 'Switch to dark mode'
        };
      case THEME_MODES.DARK:
        return {
          icon: 'fas fa-moon',
          label: 'Dark mode',
          nextLabel: 'Switch to auto mode'
        };
      case THEME_MODES.AUTO:
      default:
        return {
          icon: isDark ? "fas fa-moon" : "fas fa-sun",
          label: `Auto mode (${resolvedTheme})`,
          nextLabel: "Switch to light mode",
        };
    }
  };

  const themeInfo = getThemeInfo();

  const baseClasses = [
    'theme-toggle',
    `theme-toggle--${variant}`,
    `theme-toggle--${size}`,
    isDark ? 'theme-toggle--dark' : 'theme-toggle--light',
    isAuto ? 'theme-toggle--auto' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={baseClasses}
      onClick={toggleTheme}
      aria-label={themeInfo.nextLabel}
      title={themeInfo.nextLabel}
      type="button"
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {themeInfo.icon}
      </span>
      <span className="theme-toggle__label">
        {themeInfo.label}
      </span>
      <span className="theme-toggle__indicator" aria-hidden="true">
        {isAuto && (
          <span className="theme-toggle__auto-indicator">
            AUTO
          </span>
        )}
      </span>
    </button>
  );
};

// Compact theme toggle (icon only)
export const CompactThemeToggle = ({ className = '' }) => {
  const { mode, toggleTheme, isDark, isAuto } = useTheme();

  const getIcon = () => {
    switch (mode) {
      case THEME_MODES.LIGHT:
        return "fas fa-sun";
      case THEME_MODES.DARK:
        return '🌙';
      case THEME_MODES.AUTO:
      default:
        return isDark ? '🌙' : '☀️';
    }
  };

  const getAriaLabel = () => {
    switch (mode) {
      case THEME_MODES.LIGHT:
        return 'Switch to dark mode';
      case THEME_MODES.DARK:
        return 'Switch to auto mode';
      case THEME_MODES.AUTO:
      default:
        return 'Switch to light mode';
    }
  };

  const classes = [
    'theme-toggle',
    'theme-toggle--compact',
    isDark ? 'theme-toggle--dark' : 'theme-toggle--light',
    isAuto ? 'theme-toggle--auto' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      onClick={toggleTheme}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
      type="button"
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {getIcon()}
      </span>
      {isAuto && (
        <span className="theme-toggle__auto-dot" aria-hidden="true"></span>
      )}
    </button>
  );
};

export default ThemeToggle;