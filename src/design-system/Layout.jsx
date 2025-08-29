import React from 'react';
import PropTypes from 'prop-types';
import { useThemeVariant } from './ThemeVariantProvider';

/**
 * Page Layout Component - Main page container
 */
export const Page = ({ 
  children, 
  className = '', 
  maxWidth = 'lg',
  padding = true,
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-page';
  const classes = [
    getVariantClass(baseClass),
    `${baseClass}--max-width-${maxWidth}`,
    padding ? `${baseClass}--padded` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <main className={classes} {...props}>
      {children}
    </main>
  );
};

/**
 * Section Component - Content sections within pages
 */
export const Section = ({ 
  children, 
  className = '', 
  spacing = 'md',
  background = false,
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-section';
  const classes = [
    getVariantClass(baseClass),
    `${baseClass}--spacing-${spacing}`,
    background ? `${baseClass}--background` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
};

/**
 * Stack Component - Flexible layout with consistent spacing
 */
export const Stack = ({ 
  children, 
  className = '', 
  spacing = 'md',
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-stack';
  const classes = [
    getVariantClass(baseClass),
    `${baseClass}--${direction}`,
    `${baseClass}--spacing-${spacing}`,
    `${baseClass}--align-${align}`,
    `${baseClass}--justify-${justify}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

/**
 * Grid Component - Responsive grid layout
 */
export const Grid = ({ 
  children, 
  className = '', 
  columns = 12,
  spacing = 'md',
  responsive = true,
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-grid';
  const classes = [
    getVariantClass(baseClass),
    `${baseClass}--columns-${columns}`,
    `${baseClass}--spacing-${spacing}`,
    responsive ? `${baseClass}--responsive` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

/**
 * GridItem Component - Individual grid items
 */
export const GridItem = ({ 
  children, 
  className = '', 
  span = 1,
  spanSm,
  spanMd, 
  spanLg,
  spanXl,
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-grid-item';
  const classes = [
    getVariantClass(baseClass),
    `${baseClass}--span-${span}`,
    spanSm ? `${baseClass}--span-sm-${spanSm}` : '',
    spanMd ? `${baseClass}--span-md-${spanMd}` : '',
    spanLg ? `${baseClass}--span-lg-${spanLg}` : '',
    spanXl ? `${baseClass}--span-xl-${spanXl}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// PropTypes
Page.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  padding: PropTypes.bool,
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  spacing: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
  background: PropTypes.bool,
};

Stack.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  spacing: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
};

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  columns: PropTypes.oneOf([1, 2, 3, 4, 6, 12]),
  spacing: PropTypes.oneOf(['none', 'xs', 'sm', 'md', 'lg', 'xl']),
  responsive: PropTypes.bool,
};

GridItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  span: PropTypes.number,
  spanSm: PropTypes.number,
  spanMd: PropTypes.number,
  spanLg: PropTypes.number,
  spanXl: PropTypes.number,
};

export default { Page, Section, Stack, Grid, GridItem };