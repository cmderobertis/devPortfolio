/**
 * Badge Primitive Component
 * Status indicators, tags, and labels with consistent styling
 */

import React, { forwardRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import './Badge.css';

/**
 * Badge component for status indicators and tags
 * @param {Object} props - Component props
 * @param {'default'|'primary'|'success'|'warning'|'error'|'info'} props.variant - Badge color variant
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {boolean} props.removable - Whether badge can be removed
 * @param {boolean} props.clickable - Whether badge is clickable
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {React.ReactNode} props.children - Badge content
 * @param {Function} props.onRemove - Remove handler
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
export const Badge = forwardRef(({
  variant = 'default',
  size = 'md',
  removable = false,
  clickable = false,
  icon = null,
  children,
  onRemove,
  onClick,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const { getDataTypeColor, getStatusColor } = useTheme();

  // Handle remove click
  const handleRemove = (event) => {
    event.stopPropagation();
    if (onRemove) {
      onRemove(event);
    }
  };

  // Handle badge click
  const handleClick = (event) => {
    if (clickable && onClick) {
      onClick(event);
    }
  };

  // Determine if this is interactive
  const isInteractive = clickable || removable;

  // Generate CSS classes
  const badgeClasses = [
    'db-badge',
    `db-badge--${variant}`,
    `db-badge--${size}`,
    isInteractive && 'db-badge--interactive',
    clickable && 'db-badge--clickable',
    removable && 'db-badge--removable',
    className
  ].filter(Boolean).join(' ');

  // Remove button component
  const RemoveButton = () => (
    <button
      type="button"
      className="db-badge__remove"
      onClick={handleRemove}
      aria-label="Remove badge"
      tabIndex={-1}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );

  const Component = clickable ? 'button' : 'span';

  return (
    <Component
      ref={ref}
      className={badgeClasses}
      style={style}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...rest}
    >
      {/* Icon */}
      {icon && (
        <span className="db-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Content */}
      {children && (
        <span className="db-badge__content">
          {children}
        </span>
      )}

      {/* Remove button */}
      {removable && <RemoveButton />}
    </Component>
  );
});

Badge.displayName = 'Badge';

/**
 * Data Type Badge - Specialized badge for data types
 * @param {Object} props - Component props
 * @param {string} props.dataType - Data type name
 * @param {boolean} props.showIcon - Whether to show type icon
 */
export const DataTypeBadge = forwardRef(({
  dataType,
  showIcon = true,
  ...props
}, ref) => {
  const { getDataTypeColor } = useTheme();

  // Data type icons
  const getDataTypeIcon = (type) => {
    const iconProps = { width: 12, height: 12, fill: 'currentColor' };
    
    switch (type) {
      case 'string':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M3 17h18v2H3zm0-6h18v2H3zm0-6h18v2H3z"/>
          </svg>
        );
      case 'number':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M7 17h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-8-4h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM7 9h2V7H7v2zm4 0h2V7h-2v2zm4 0h2V7h-2v2z"/>
          </svg>
        );
      case 'boolean':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
        );
      case 'date':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        );
      case 'json':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M5 3h2v2h2v2H7v2H5V7H3V5h2V3zm0 8h2v2h2v2H7v2H5v-2H3v-2h2v-2zm8-8h2v2h2v2h-2v2h-2V7h-2V5h2V3zm0 8h2v2h2v2h-2v2h-2v-2h-2v-2h2v-2z"/>
          </svg>
        );
      case 'array':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M4 18h3v-2H4v2zM4 13h9v-2H4v2zm0-5h16V6H4v2zm0-5h16V1H4v2z"/>
          </svg>
        );
      default:
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
          </svg>
        );
    }
  };

  const customStyle = {
    backgroundColor: getDataTypeColor(dataType, 'bg'),
    color: getDataTypeColor(dataType, 'text'),
    borderColor: getDataTypeColor(dataType, 'light'),
    ...props.style
  };

  return (
    <Badge
      ref={ref}
      variant="default"
      icon={showIcon ? getDataTypeIcon(dataType) : null}
      style={customStyle}
      {...props}
    >
      {dataType}
    </Badge>
  );
});

DataTypeBadge.displayName = 'DataTypeBadge';

export default Badge;