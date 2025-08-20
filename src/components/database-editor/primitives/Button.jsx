/**
 * Button Primitive Component
 * Universal button with consistent styling, behavior, and accessibility
 */

import React, { forwardRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import './Button.css';

/**
 * Button component with multiple variants and states
 * @param {Object} props - Component props
 * @param {'primary'|'secondary'|'danger'|'ghost'|'link'} props.variant - Button style variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} props.size - Button size
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {boolean} props.active - Whether button is in active state
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {boolean} props.iconOnly - Whether this is an icon-only button
 * @param {boolean} props.fullWidth - Whether button takes full width
 * @param {'button'|'submit'|'reset'} props.type - Button type
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
export const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  active = false,
  leftIcon = null,
  rightIcon = null,
  iconOnly = false,
  fullWidth = false,
  type = 'button',
  onClick,
  children,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const { createStyles, getTransition } = useTheme();

  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  // Handle click events
  const handleClick = (event) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(event);
    }
  };

  // Generate CSS classes
  const cssClasses = [
    'db-button',
    `db-button--${variant}`,
    `db-button--${size}`,
    active && 'db-button--active',
    loading && 'db-button--loading',
    isDisabled && 'db-button--disabled',
    iconOnly && 'db-button--icon-only',
    fullWidth && 'db-button--full-width',
    className
  ].filter(Boolean).join(' ');

  // Loading spinner component
  const LoadingSpinner = () => (
    <span className="db-button__spinner" aria-hidden="true">
      <svg className="db-animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
          className="opacity-25"
        />
        <path 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          className="opacity-75"
        />
      </svg>
    </span>
  );

  return (
    <button
      ref={ref}
      type={type}
      className={cssClasses}
      disabled={isDisabled}
      onClick={handleClick}
      style={style}
      aria-pressed={active}
      aria-busy={loading}
      {...rest}
    >
      {/* Left icon or loading spinner */}
      {loading && !rightIcon ? (
        <LoadingSpinner />
      ) : leftIcon ? (
        <span className="db-button__icon db-button__icon--left" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}

      {/* Button content */}
      {!iconOnly && children && (
        <span className="db-button__content">
          {children}
        </span>
      )}

      {/* Right icon or loading spinner */}
      {loading && rightIcon ? (
        <LoadingSpinner />
      ) : rightIcon ? (
        <span className="db-button__icon db-button__icon--right" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}

      {/* Icon-only content */}
      {iconOnly && !loading && (leftIcon || rightIcon || children)}
      {iconOnly && loading && <LoadingSpinner />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;