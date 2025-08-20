import React from 'react';
import PropTypes from 'prop-types';

/**
 * Material Design 3 Typography Component
 * Provides consistent typography styling following MD3 typescale
 */
const Typography = ({
  variant = 'body-large',
  component,
  children,
  className = '',
  color = 'default',
  align = 'inherit',
  ...props
}) => {
  // Map variants to default HTML elements
  const getDefaultComponent = (variant) => {
    const componentMap = {
      'display-large': 'h1',
      'display-medium': 'h1',
      'display-small': 'h2',
      'headline-large': 'h2',
      'headline-medium': 'h3',
      'headline-small': 'h4',
      'title-large': 'h5',
      'title-medium': 'h6',
      'title-small': 'h6',
      'body-large': 'p',
      'body-medium': 'p',
      'body-small': 'p',
      'label-large': 'span',
      'label-medium': 'span',
      'label-small': 'span',
    };
    return componentMap[variant] || 'p';
  };

  const Component = component || getDefaultComponent(variant);

  const getTypographyClasses = () => {
    const baseClasses = [
      'md3-typography',
      `md3-typography--${variant}`,
      className
    ];

    if (color !== 'default') {
      baseClasses.push(`md3-typography--${color}`);
    }

    if (align !== 'inherit') {
      baseClasses.push(`md3-typography--align-${align}`);
    }

    return baseClasses.filter(Boolean).join(' ');
  };

  return (
    <Component className={getTypographyClasses()} {...props}>
      {children}
    </Component>
  );
};

Typography.propTypes = {
  variant: PropTypes.oneOf([
    'display-large',
    'display-medium', 
    'display-small',
    'headline-large',
    'headline-medium',
    'headline-small',
    'title-large',
    'title-medium',
    'title-small',
    'body-large',
    'body-medium',
    'body-small',
    'label-large',
    'label-medium',
    'label-small'
  ]),
  component: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  color: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'tertiary',
    'error',
    'on-surface',
    'on-surface-variant',
    'outline'
  ]),
  align: PropTypes.oneOf(['inherit', 'left', 'center', 'right', 'justify']),
};

export default Typography;