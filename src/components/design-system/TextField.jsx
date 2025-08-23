import React, { useState, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import './TextField.css';

/**
 * Material Design 3 TextField Component
 * Provides text input with consistent styling, validation, and accessibility
 */
const TextField = forwardRef(({
  label,
  placeholder,
  value = '',
  type = 'text',
  variant = 'outlined',
  size = 'medium',
  error = false,
  disabled = false,
  helperText,
  prefix,
  suffix,
  multiline = false,
  rows = 4,
  maxLength,
  clearable = false,
  className = '',
  onChange,
  onFocus,
  onBlur,
  onClear,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef(null);
  const textFieldId = useRef(`md3-textfield-${Math.random().toString(36).slice(2, 11)}`);

  // Use forwarded ref or fallback to internal ref
  const actualRef = ref || inputRef;

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setHasValue(!!newValue);
    if (onChange) {
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

  const handleClear = () => {
    const event = {
      target: { value: '' },
      currentTarget: actualRef.current
    };
    setHasValue(false);
    if (onChange) {
      onChange(event);
    }
    if (onClear) {
      onClear();
    }
    actualRef.current?.focus();
  };

  const containerClasses = [
    'md3-textfield',
    `md3-textfield--${variant}`,
    `md3-textfield--${size}`,
    className,
    focused && 'md3-textfield--focused',
    error && 'md3-textfield--error',
    disabled && 'md3-textfield--disabled',
    (hasValue || focused) && 'md3-textfield--populated',
  ].filter(Boolean).join(' ');

  const InputComponent = multiline ? 'textarea' : 'input';
  const inputProps = {
    ref: actualRef,
    id: textFieldId.current,
    className: 'md3-textfield__input',
    value,
    placeholder: variant === 'filled' ? placeholder : undefined,
    disabled,
    maxLength,
    onChange: handleInputChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ...props
  };

  if (!multiline) {
    inputProps.type = type;
  } else {
    inputProps.rows = rows;
  }

  return (
    <div className={containerClasses}>
      <div className="md3-textfield__container">
        {prefix && (
          <div className="md3-textfield__prefix">{prefix}</div>
        )}

        <div className="md3-textfield__input-wrapper">
          {label && (
            <label
              htmlFor={textFieldId.current}
              className="md3-textfield__label"
            >
              {label}
            </label>
          )}

          <InputComponent {...inputProps} />

          {variant === 'outlined' && placeholder && (
            <div className="md3-textfield__placeholder">
              {placeholder}
            </div>
          )}
        </div>

        {(suffix || clearable) && (
          <div className="md3-textfield__suffix">
            {suffix}
            {clearable && (hasValue && !disabled) && (
              <button
                type="button"
                className="md3-textfield__clear"
                onClick={handleClear}
                aria-label="Clear input"
                tabIndex={-1}
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className="md3-textfield__state-layer" />
      </div>

      {helperText && (
        <div className="md3-textfield__helper-text">
          {helperText}
        </div>
      )}

      {maxLength && (
        <div className="md3-textfield__counter">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';

TextField.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.oneOf(['outlined', 'filled']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  helperText: PropTypes.string,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  clearable: PropTypes.bool,
  className: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onClear: PropTypes.func,
};

export default TextField;