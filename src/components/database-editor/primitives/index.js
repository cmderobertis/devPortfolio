/**
 * Database Editor Primitives
 * Export all primitive components for easy importing
 */

// Core primitives
export { Button, default as ButtonComponent } from './Button.jsx';
export { Input, default as InputComponent } from './Input.jsx';
export { Card, default as CardComponent } from './Card.jsx';
export { Badge, DataTypeBadge, default as BadgeComponent } from './Badge.jsx';
export { Tooltip, default as TooltipComponent } from './Tooltip.jsx';

// Import all CSS files to ensure styles are loaded
import './Button.css';
import './Input.css';
import './Card.css';
import './Badge.css';
import './Tooltip.css';

// Re-export commonly used components as default exports
export {
  Button as DBButton,
  Input as DBInput, 
  Card as DBCard,
  Badge as DBBadge,
  DataTypeBadge as DBDataTypeBadge,
  Tooltip as DBTooltip
};