import React from 'react';
import PropTypes from 'prop-types';

/**
 * Material Design 3 Card Component
 * Provides consistent card styling with elevation, spacing, and theming
 */
const Card = ({
  children,
  variant = 'elevated',
  className = '',
  onClick,
  hover = false,
  ...props
}) => {
  const getCardClasses = () => {
    const baseClasses = [
      'md3-card',
      className
    ];

    // Add variant classes
    switch (variant) {
      case 'filled':
        baseClasses.push('md3-card--filled');
        break;
      case 'outlined':
        baseClasses.push('md3-card--outlined');
        break;
      case 'elevated':
      default:
        baseClasses.push('md3-card--elevated');
        break;
    }

    // Add interactive classes
    if (onClick || hover) {
      baseClasses.push('md3-card--interactive');
    }

    return baseClasses.filter(Boolean).join(' ');
  };

  const cardProps = {
    className: getCardClasses(),
    onClick,
    ...props
  };

  // Add role for accessibility if interactive
  if (onClick) {
    cardProps.role = 'button';
    cardProps.tabIndex = 0;
    cardProps.onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    };
  }

  return (
    <div {...cardProps}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['elevated', 'filled', 'outlined']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  hover: PropTypes.bool,
};

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`md3-card__header ${className}`} {...props}>
    {children}
  </div>
);

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Content Component
 */
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`md3-card__content ${className}`} {...props}>
    {children}
  </div>
);

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Card Actions Component
 */
export const CardActions = ({ children, className = '', align = 'end', ...props }) => (
  <div className={`md3-card__actions md3-card__actions--${align} ${className}`} {...props}>
    {children}
  </div>
);

CardActions.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  align: PropTypes.oneOf(['start', 'end', 'center']),
};

export default Card;