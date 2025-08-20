/**
 * Card Primitive Component
 * Universal container with consistent styling and layout slots
 */

import React, { forwardRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import './Card.css';

/**
 * Card component with header, body, and footer slots
 * @param {Object} props - Component props
 * @param {'flat'|'outlined'|'elevated'} props.variant - Card style variant
 * @param {'sm'|'md'|'lg'} props.padding - Padding size
 * @param {boolean} props.interactive - Whether card is clickable/hoverable
 * @param {boolean} props.loading - Whether card is in loading state
 * @param {boolean} props.collapsible - Whether card can be collapsed
 * @param {boolean} props.collapsed - Whether card is currently collapsed
 * @param {React.ReactNode} props.header - Header content
 * @param {React.ReactNode} props.headerActions - Actions in header (usually buttons)
 * @param {React.ReactNode} props.children - Main content (body)
 * @param {React.ReactNode} props.footer - Footer content
 * @param {Function} props.onCollapse - Collapse toggle handler
 * @param {Function} props.onClick - Click handler (when interactive)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
export const Card = forwardRef(({
  variant = 'outlined',
  padding = 'md',
  interactive = false,
  loading = false,
  collapsible = false,
  collapsed = false,
  header = null,
  headerActions = null,
  children,
  footer = null,
  onCollapse,
  onClick,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const { getTransition } = useTheme();

  // Handle collapse toggle
  const handleCollapseToggle = () => {
    if (collapsible && onCollapse) {
      onCollapse(!collapsed);
    }
  };

  // Handle card click
  const handleClick = (event) => {
    // Don't trigger card click if clicking on interactive elements
    if (event.target.closest('button, a, input, select, textarea')) {
      return;
    }

    if (interactive && onClick) {
      onClick(event);
    }
  };

  // Generate CSS classes
  const cardClasses = [
    'db-card',
    `db-card--${variant}`,
    `db-card--padding-${padding}`,
    interactive && 'db-card--interactive',
    loading && 'db-card--loading',
    collapsible && 'db-card--collapsible',
    collapsed && 'db-card--collapsed',
    className
  ].filter(Boolean).join(' ');

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="db-card__loading-skeleton">
      <div className="db-card__skeleton-line db-card__skeleton-line--title"></div>
      <div className="db-card__skeleton-line db-card__skeleton-line--short"></div>
      <div className="db-card__skeleton-line db-card__skeleton-line--medium"></div>
      <div className="db-card__skeleton-line db-card__skeleton-line--long"></div>
    </div>
  );

  // Collapse icon component
  const CollapseIcon = () => (
    <svg 
      className="db-card__collapse-icon" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
    >
      <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
  );

  return (
    <div
      ref={ref}
      className={cardClasses}
      style={style}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-expanded={collapsible ? !collapsed : undefined}
      {...rest}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="db-card__loading-overlay">
          <div className="db-card__loading-spinner">
            <svg className="db-animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="opacity-25"
              />
              <path 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Header */}
      {(header || headerActions || collapsible) && (
        <div className="db-card__header">
          <div className="db-card__header-content">
            {header && (
              <div className="db-card__header-text">
                {header}
              </div>
            )}
          </div>
          
          <div className="db-card__header-actions">
            {headerActions}
            
            {collapsible && (
              <button
                type="button"
                className="db-card__collapse-button"
                onClick={handleCollapseToggle}
                aria-label={collapsed ? 'Expand card' : 'Collapse card'}
              >
                <CollapseIcon />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="db-card__body">
        {loading ? <LoadingSkeleton /> : children}
      </div>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="db-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;