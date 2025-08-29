import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

/**
 * Material Design 3 Button Component
 * Provides consistent button styling with variants, states, and theming
 */
const Button = ({
  children,
  variant = 'filled',
  size = 'medium',
  icon,
  iconPosition = 'start',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const getButtonClasses = () => {
    const baseClasses = [
      'md3-button',
      `md3-button--${variant}`,
      `md3-button--${size}`,
      className
    ];

    if (disabled) {
      baseClasses.push('md3-button--disabled');
    }

    if (loading) {
      baseClasses.push('md3-button--loading');
    }

    if (icon && !children) {
      baseClasses.push('md3-button--icon-only');
    }

    return baseClasses.filter(Boolean).join(' ');
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const renderIcon = (position) => {
    if (!icon || iconPosition !== position) return null;
    
    if (loading && position === 'start') {
      return <span className="md3-button__spinner" />;
    }
    
    return <span className="md3-button__icon">{icon}</span>;
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {renderIcon('start')}
      {children && <span className="md3-button__text">{children}</span>}
      {renderIcon('end')}
      <span className="md3-button__state-layer" />
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['filled', 'outlined', 'text', 'elevated', 'tonal']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['start', 'end']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;