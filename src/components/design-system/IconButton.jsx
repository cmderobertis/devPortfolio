import React from 'react';
import './IconButton.css';

/**
 * Universal Icon Button Component - Material Design 3
 * Perfect for any icon-only button throughout the site
 * Automatically circular with centered icons using responsive units
 */
const IconButton = ({ 
  icon, 
  onClick, 
  variant = 'default', 
  size = 'medium',
  ariaLabel,
  title,
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseClasses = [
    'icon-button',
    `icon-button--${variant}`,
    `icon-button--${size}`,
    disabled && 'icon-button--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      disabled={disabled}
      type="button"
      {...props}
    >
      <span className="icon-button__icon" aria-hidden="true">
        <i className={icon}></i>
      </span>
    </button>
  );
};

export default IconButton;