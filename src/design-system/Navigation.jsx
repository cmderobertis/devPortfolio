import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useThemeVariant } from './ThemeVariantProvider';
import Button from './Button';
import Typography from './Typography';

/**
 * Enhanced Navbar Component with Material Design 3 support
 */
export const Navbar = ({ 
  brand, 
  children, 
  className = '', 
  sticky = true,
  transparent = false,
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  const [isOpen, setIsOpen] = useState(false);
  
  const baseClass = 'md3-navbar';
  const classes = [
    getVariantClass(baseClass),
    sticky ? `${baseClass}--sticky` : '',
    transparent ? `${baseClass}--transparent` : '',
    isOpen ? `${baseClass}--open ` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <nav className={classes} {...props}>
      <div className={`${baseClass}__container`}>
        {brand && (
          <div className={`${baseClass}__brand`}>
            {brand}
          </div>
        )}
        
        <button 
          className={`${baseClass}__toggle`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X size={24} className={`${baseClass}__toggle-icon`} />
          ) : (
            <Menu size={24} className={`${baseClass}__toggle-icon`} />
          )}
        </button>
        
        <div className={`${baseClass}__content ${isOpen ? `${baseClass}__content--open` : ''}`}>
          {children}
        </div>
      </div>
    </nav>
  );
};

/**
 * Navigation List Component
 */
export const NavList = ({ 
  children, 
  className = '', 
  direction = 'horizontal',
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-nav-list';
  const classes = [
    getVariantClass(baseClass),
    `${baseClass}--${direction}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <ul className={classes} {...props}>
      {children}
    </ul>
  );
};

/**
 * Navigation Item Component
 */
export const NavItem = ({ 
  children, 
  className = '',
  active = false,
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-nav-item';
  const classes = [
    getVariantClass(baseClass),
    active ? `${baseClass}--active` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <li className={classes} {...props}>
      {children}
    </li>
  );
};

/**
 * Enhanced Navigation Link Component
 */
export const NavLink = ({ 
  children, 
  to,
  className = '',
  variant = 'text',
  exact = false,
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-nav-link';
  const classes = [
    getVariantClass(baseClass),
    `${baseClass}--${variant}`,
    className
  ].filter(Boolean).join(' ');

  if (to) {
    return (
      <RouterNavLink 
        to={to}
        className={({ isActive }) => 
          `${classes} ${isActive ? `${baseClass}--active` : ''}`
        }
        {...props}
      >
        {children}
      </RouterNavLink>
    );
  }

  return (
    <a className={classes} {...props}>
      {children}
    </a>
  );
};

/**
 * Breadcrumb Navigation Component
 */
export const Breadcrumbs = ({ 
  children, 
  className = '',
  separator = '/',
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-breadcrumbs';
  const classes = [
    getVariantClass(baseClass),
    className
  ].filter(Boolean).join(' ');

  const items = React.Children.toArray(children);

  return (
    <nav className={classes} {...props}>
      <ol className={`${baseClass}__list`}>
        {items.map((item, index) => (
          <li key={index} className={`${baseClass}__item`}>
            {item}
            {index < items.length - 1 && (
              <span className={`${baseClass}__separator`}>{separator}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * Tab Navigation Component
 */
export const Tabs = ({ 
  children, 
  className = '',
  value,
  onChange,
  variant = 'primary',
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-tabs';
  const classes = [
    getVariantClass(baseClass),
    `${baseClass}--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="tablist" {...props}>
      <div className={`${baseClass}__list`}>
        {React.Children.map(children, (child, index) => 
          React.cloneElement(child, {
            selected: value === child.props.value,
            onClick: () => onChange?.(child.props.value),
            tabIndex: value === child.props.value ? 0 : -1,
          })
        )}
      </div>
      <div className={`${baseClass}__indicator`}></div>
    </div>
  );
};

/**
 * Individual Tab Component
 */
export const Tab = ({ 
  children, 
  className = '',
  value,
  selected = false,
  disabled = false,
  onClick,
  ...props 
}) => {
  const { getVariantClass } = useThemeVariant();
  
  const baseClass = 'md3-tab';
  const classes = [
    getVariantClass(baseClass),
    selected ? `${baseClass}--selected` : '',
    disabled ? `${baseClass}--disabled` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classes}
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      <span className={`${baseClass}__content`}>
        {children}
      </span>
      <span className={`${baseClass}__state-layer`}></span>
    </button>
  );
};

// PropTypes
Navbar.propTypes = {
  brand: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  sticky: PropTypes.bool,
  transparent: PropTypes.bool,
};

NavList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
};

NavItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  active: PropTypes.bool,
};

NavLink.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['text', 'filled', 'outlined']),
  exact: PropTypes.bool,
};

Breadcrumbs.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  separator: PropTypes.string,
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary']),
};

Tab.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  value: PropTypes.any,
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default { Navbar, NavList, NavItem, NavLink, Breadcrumbs, Tabs, Tab };