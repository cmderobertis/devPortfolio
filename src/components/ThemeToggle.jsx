import React, { useState } from 'react';
import { useTheme, THEME_MODES } from '../context/ThemeContext';
import ColorSchemeSelector from './ColorSchemeSelector';
import IconButton from './design-system/IconButton';
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
      icon={themeInfo.icon}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        <i className={themeInfo.icon}></i>
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
        return 'fas fa-sun';
      case THEME_MODES.DARK:
        return 'fas fa-moon';
      case THEME_MODES.AUTO:
      default:
        return isDark ? 'fas fa-moon' : 'fas fa-sun';
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
    <IconButton
      icon={getIcon()}
      onClick={toggleTheme}
      variant="default"
      size="medium"
      ariaLabel={getAriaLabel()}
      title={getAriaLabel()}
      className={`${isAuto ? 'theme-toggle--auto' : ''} ${className}`}
    />
  );
};

// Enhanced theme toggle with color scheme selector
export const ThemeToggleWithColorSelector = ({ variant = 'default', size = 'medium', className = '' }) => {
  const { mode, resolvedTheme, toggleTheme, isDark, isAuto, currentPalette } = useTheme();
  const [showColorSelector, setShowColorSelector] = useState(false);

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
    'theme-toggle-group',
    `theme-toggle-group--${variant}`,
    `theme-toggle-group--${size}`,
    isDark ? 'theme-toggle-group--dark' : 'theme-toggle-group--light',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={baseClasses}>
        <IconButton
          icon={themeInfo.icon}
          onClick={toggleTheme}
          variant="filled"
          size={size}
          ariaLabel={themeInfo.nextLabel}
          title={themeInfo.nextLabel}
          className={isAuto ? 'theme-toggle--auto' : ''}
        />
        
        <IconButton
          icon="fas fa-palette"
          onClick={() => setShowColorSelector(true)}
          variant="secondary"
          size={size}
          ariaLabel="Choose color scheme"
          title="Choose color scheme"
        />
      </div>
      
      <ColorSchemeSelector 
        isOpen={showColorSelector}
        onClose={() => setShowColorSelector(false)}
      />
    </>
  );
};

export default ThemeToggle;