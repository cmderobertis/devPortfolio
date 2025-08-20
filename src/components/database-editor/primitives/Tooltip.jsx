/**
 * Tooltip Primitive Component
 * Accessible tooltips with rich content support
 */

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import './Tooltip.css';

/**
 * Tooltip component with automatic positioning
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Element that triggers tooltip
 * @param {React.ReactNode} props.content - Tooltip content
 * @param {'top'|'bottom'|'left'|'right'} props.placement - Preferred placement
 * @param {'hover'|'click'|'focus'|'manual'} props.trigger - Trigger behavior
 * @param {boolean} props.open - Controlled open state
 * @param {number} props.delay - Show delay in ms
 * @param {number} props.hideDelay - Hide delay in ms
 * @param {boolean} props.disabled - Whether tooltip is disabled
 * @param {boolean} props.arrow - Whether to show arrow
 * @param {number} props.offset - Distance from trigger element
 * @param {Function} props.onOpenChange - Open state change handler
 * @param {string} props.className - Additional CSS classes for tooltip
 */
export const Tooltip = forwardRef(({
  children,
  content,
  placement = 'top',
  trigger = 'hover',
  open,
  delay = 500,
  hideDelay = 0,
  disabled = false,
  arrow = true,
  offset = 8,
  onOpenChange,
  className = '',
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [actualPlacement, setActualPlacement] = useState(placement);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const { getTransition } = useTheme();

  // Use controlled state if provided
  const isControlled = open !== undefined;
  const tooltipOpen = isControlled ? open : isOpen;

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Calculate position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let x = 0;
    let y = 0;
    let finalPlacement = placement;

    // Calculate initial position based on preferred placement
    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Check viewport boundaries and adjust if necessary
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal boundary checks
    if (x < 0) {
      if (placement === 'left') {
        finalPlacement = 'right';
        x = triggerRect.right + offset;
      } else {
        x = 8; // Minimum margin
      }
    } else if (x + tooltipRect.width > viewportWidth) {
      if (placement === 'right') {
        finalPlacement = 'left';
        x = triggerRect.left - tooltipRect.width - offset;
      } else {
        x = viewportWidth - tooltipRect.width - 8;
      }
    }

    // Vertical boundary checks
    if (y < 0) {
      if (placement === 'top') {
        finalPlacement = 'bottom';
        y = triggerRect.bottom + offset;
      } else {
        y = 8; // Minimum margin
      }
    } else if (y + tooltipRect.height > viewportHeight) {
      if (placement === 'bottom') {
        finalPlacement = 'top';
        y = triggerRect.top - tooltipRect.height - offset;
      } else {
        y = viewportHeight - tooltipRect.height - 8;
      }
    }

    setPosition({ x: x + scrollX, y: y + scrollY });
    setActualPlacement(finalPlacement);
  };

  // Show tooltip
  const showTooltip = () => {
    if (disabled || !content) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (delay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        if (!isControlled) {
          setIsOpen(true);
        }
        if (onOpenChange) {
          onOpenChange(true);
        }
      }, delay);
    } else {
      if (!isControlled) {
        setIsOpen(true);
      }
      if (onOpenChange) {
        onOpenChange(true);
      }
    }
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        if (!isControlled) {
          setIsOpen(false);
        }
        if (onOpenChange) {
          onOpenChange(false);
        }
      }, hideDelay);
    } else {
      if (!isControlled) {
        setIsOpen(false);
      }
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  // Toggle tooltip (for click trigger)
  const toggleTooltip = () => {
    if (tooltipOpen) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideTooltip();
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus' || trigger === 'hover') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus' || trigger === 'hover') {
      hideTooltip();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      toggleTooltip();
    }
  };

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (tooltipOpen && tooltipRef.current) {
      calculatePosition();
    }
  }, [tooltipOpen, content, placement]);

  // Handle window resize and scroll
  useEffect(() => {
    if (!tooltipOpen) return;

    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [tooltipOpen]);

  // Close on escape key
  useEffect(() => {
    if (!tooltipOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        hideTooltip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [tooltipOpen]);

  // Close on outside click (for click trigger)
  useEffect(() => {
    if (!tooltipOpen || trigger !== 'click') return;

    const handleOutsideClick = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target)
      ) {
        hideTooltip();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [tooltipOpen, trigger]);

  // Generate tooltip classes
  const tooltipClasses = [
    'db-tooltip',
    `db-tooltip--${actualPlacement}`,
    arrow && 'db-tooltip--with-arrow',
    className
  ].filter(Boolean).join(' ');

  // Clone children with event handlers
  const triggerElement = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onClick: handleClick,
    'aria-describedby': tooltipOpen ? 'tooltip' : undefined,
    ...children.props
  });

  // Tooltip portal
  const tooltipPortal = tooltipOpen && content && (
    <div
      ref={tooltipRef}
      className={tooltipClasses}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1060,
        pointerEvents: trigger === 'click' ? 'auto' : 'none'
      }}
      role="tooltip"
      id="tooltip"
      {...rest}
    >
      <div className="db-tooltip__content">
        {content}
      </div>
      {arrow && <div className="db-tooltip__arrow" />}
    </div>
  );

  return (
    <>
      {triggerElement}
      {typeof document !== 'undefined' && createPortal(
        tooltipPortal,
        document.body
      )}
    </>
  );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;