import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './Checkbox.css';

/**
 * Material Design 3 Checkbox Component
 * Provides consistent checkbox styling with states and theming
 */
const Checkbox = ({
  checked = false,
  indeterminate = false,
  disabled = false,
  error = false,
  label,
  helperText,
  size = 'medium',
  className = '',
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const checkboxId = useRef(`md3-checkbox-${Math.random().toString(36).slice(2, 11)}`);

  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e);
    }
  };

  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const containerClasses = [
    'md3-checkbox',
    `md3-checkbox--${size}`,
    className,
    checked && 'md3-checkbox--checked',
    indeterminate && 'md3-checkbox--indeterminate',
    disabled && 'md3-checkbox--disabled',
    error && 'md3-checkbox--error',
    focused && 'md3-checkbox--focused',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="md3-checkbox__container">
        <input
          type="checkbox"
          id={checkboxId.current}
          className="md3-checkbox__input"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={(input) => {
            if (input) {
              input.indeterminate = indeterminate;
            }
          }}
          {...props}
        />
        
        <div className="md3-checkbox__background">
          <div className="md3-checkbox__checkmark">
            <svg
              className="md3-checkbox__checkmark-path"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {indeterminate ? (
                <rect x="6" y="11" width="12" height="2" rx="1" />
              ) : (
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
        </div>
        
        <div className="md3-checkbox__state-layer" />
      </div>

      {label && (
        <label htmlFor={checkboxId.current} className="md3-checkbox__label">
          {label}
        </label>
      )}

      {helperText && (
        <div className="md3-checkbox__helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  label: PropTypes.string,
  helperText: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

export default Checkbox;