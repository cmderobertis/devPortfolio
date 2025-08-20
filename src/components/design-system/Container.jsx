import React from 'react';
import PropTypes from 'prop-types';

/**
 * Material Design 3 Container Component
 * Provides consistent layout containers with responsive behavior
 */
const Container = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  className = '',
  ...props
}) => {
  const getContainerClasses = () => {
    const baseClasses = [
      'md3-container',
      `md3-container--${maxWidth}`,
      className
    ];

    if (disableGutters) {
      baseClasses.push('md3-container--no-gutters');
    }

    return baseClasses.filter(Boolean).join(' ');
  };

  return (
    <div className={getContainerClasses()} {...props}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'fluid']),
  disableGutters: PropTypes.bool,
  className: PropTypes.string,
};

/**
 * Section Component for semantic layout
 */
export const Section = ({
  children,
  spacing = 'medium',
  className = '',
  ...props
}) => (
  <section className={`md3-section md3-section--${spacing} ${className}`} {...props}>
    {children}
  </section>
);

Section.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.oneOf(['none', 'small', 'medium', 'large']),
  className: PropTypes.string,
};

/**
 * Grid Container Component
 */
export const Grid = ({
  children,
  container = false,
  item = false,
  spacing = 2,
  columns = 12,
  xs,
  sm,
  md,
  lg,
  xl,
  className = '',
  ...props
}) => {
  const getGridClasses = () => {
    const baseClasses = ['md3-grid', className];

    if (container) {
      baseClasses.push('md3-grid--container');
      baseClasses.push(`md3-grid--spacing-${spacing}`);
    }

    if (item) {
      baseClasses.push('md3-grid--item');
      
      // Add responsive classes
      if (xs) baseClasses.push(`md3-grid--xs-${xs}`);
      if (sm) baseClasses.push(`md3-grid--sm-${sm}`);
      if (md) baseClasses.push(`md3-grid--md-${md}`);
      if (lg) baseClasses.push(`md3-grid--lg-${lg}`);
      if (xl) baseClasses.push(`md3-grid--xl-${xl}`);
    }

    return baseClasses.filter(Boolean).join(' ');
  };

  return (
    <div className={getGridClasses()} {...props}>
      {children}
    </div>
  );
};

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  container: PropTypes.bool,
  item: PropTypes.bool,
  spacing: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),
  columns: PropTypes.number,
  xs: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'auto']),
  sm: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'auto']),
  md: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'auto']),
  lg: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'auto']),
  xl: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'auto']),
  className: PropTypes.string,
};

export default Container;