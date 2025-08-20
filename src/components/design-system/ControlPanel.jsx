import React from 'react';
import PropTypes from 'prop-types';

/**
 * Material Design 3 Control Panel Components
 * Standardized controls for interactive simulations
 */

/**
 * Main Control Panel Container
 */
const ControlPanel = ({ 
  children, 
  title, 
  position = 'bottom', 
  collapsible = false,
  className = '',
  ...props 
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const getPositionClasses = () => {
    const positionMap = {
      top: 'md3-control-panel--top',
      bottom: 'md3-control-panel--bottom',
      left: 'md3-control-panel--left',
      right: 'md3-control-panel--right',
      floating: 'md3-control-panel--floating'
    };
    return positionMap[position] || positionMap.bottom;
  };

  return (
    <div 
      className={`md3-control-panel ${getPositionClasses()} ${className} ${isCollapsed ? 'md3-control-panel--collapsed' : ''}`}
      {...props}
    >
      {title && (
        <div className="md3-control-panel__header">
          <span className="md3-control-panel__title">{title}</span>
          {collapsible && (
            <button
              className="md3-control-panel__toggle"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand controls' : 'Collapse controls'}
            >
              <i className={`fas fa-chevron-${isCollapsed ? 'up' : 'down'}`}></i>
            </button>
          )}
        </div>
      )}
      <div className="md3-control-panel__content">
        {children}
      </div>
    </div>
  );
};

/**
 * Control Group - groups related controls together
 */
export const ControlGroup = ({ 
  children, 
  label, 
  direction = 'horizontal',
  className = '',
  ...props 
}) => (
  <div 
    className={`md3-control-group md3-control-group--${direction} ${className}`}
    {...props}
  >
    {label && <span className="md3-control-group__label">{label}</span>}
    <div className="md3-control-group__controls">
      {children}
    </div>
  </div>
);

/**
 * Slider Control
 */
export const SliderControl = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  icon,
  disabled = false,
  className = '',
  ...props
}) => (
  <div className={`md3-slider-control ${className}`}>
    <div className="md3-slider-control__header">
      <label className="md3-slider-control__label">
        {icon && <i className={`${icon} me-2`}></i>}
        {label}
      </label>
      <span className="md3-slider-control__value">
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      className="md3-slider-control__input"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      {...props}
    />
  </div>
);

/**
 * Button Control
 */
export const ButtonControl = ({
  children,
  variant = 'outlined',
  size = 'small',
  icon,
  active = false,
  className = '',
  ...props
}) => (
  <button
    className={`md3-button-control md3-button-control--${variant} md3-button-control--${size} ${active ? 'md3-button-control--active' : ''} ${className}`}
    {...props}
  >
    {icon && <i className={`${icon} me-1`}></i>}
    {children}
  </button>
);

/**
 * Toggle Control (Switch)
 */
export const ToggleControl = ({
  label,
  checked,
  onChange,
  icon,
  disabled = false,
  className = '',
  ...props
}) => (
  <div className={`md3-toggle-control ${className}`}>
    <label className="md3-toggle-control__label">
      {icon && <i className={`${icon} me-2`}></i>}
      {label}
      <input
        type="checkbox"
        className="md3-toggle-control__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      <span className="md3-toggle-control__slider"></span>
    </label>
  </div>
);

/**
 * Select Control (Dropdown)
 */
export const SelectControl = ({
  label,
  value,
  onChange,
  options = [],
  icon,
  disabled = false,
  className = '',
  ...props
}) => (
  <div className={`md3-select-control ${className}`}>
    <label className="md3-select-control__label">
      {icon && <i className={`${icon} me-2`}></i>}
      {label}
    </label>
    <select
      className="md3-select-control__input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      {...props}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Info Display - shows read-only information
 */
export const InfoDisplay = ({
  label,
  value,
  unit = '',
  icon,
  color = 'default',
  className = '',
  ...props
}) => (
  <div className={`md3-info-display md3-info-display--${color} ${className}`} {...props}>
    <div className="md3-info-display__label">
      {icon && <i className={`${icon} me-1`}></i>}
      {label}
    </div>
    <div className="md3-info-display__value">
      {value}{unit}
    </div>
  </div>
);

/**
 * Status Indicator
 */
export const StatusIndicator = ({
  status = 'idle',
  label,
  className = '',
  ...props
}) => (
  <div className={`md3-status-indicator md3-status-indicator--${status} ${className}`} {...props}>
    <div className="md3-status-indicator__dot"></div>
    {label && <span className="md3-status-indicator__label">{label}</span>}
  </div>
);

// PropTypes
ControlPanel.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'floating']),
  collapsible: PropTypes.bool,
  className: PropTypes.string,
};

ControlGroup.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string,
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  className: PropTypes.string,
};

SliderControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  unit: PropTypes.string,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

ButtonControl.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['outlined', 'filled', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.string,
  active: PropTypes.bool,
  className: PropTypes.string,
};

ToggleControl.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

SelectControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

InfoDisplay.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error']),
  className: PropTypes.string,
};

StatusIndicator.propTypes = {
  status: PropTypes.oneOf(['idle', 'running', 'paused', 'error', 'success']),
  label: PropTypes.string,
  className: PropTypes.string,
};

export default ControlPanel;