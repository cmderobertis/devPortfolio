/**
 * Input Primitive Component
 * Universal input with validation, formatting, and accessibility
 */

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import './Input.css';

/**
 * Input component with validation and enhanced features
 * @param {Object} props - Component props
 * @param {'text'|'email'|'password'|'number'|'search'|'url'|'tel'} props.type - Input type
 * @param {'sm'|'md'|'lg'} props.size - Input size
 * @param {string} props.value - Input value (controlled)
 * @param {string} props.defaultValue - Default value (uncontrolled)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.readOnly - Whether input is read-only
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.invalid - Whether input has validation errors
 * @param {string} props.error - Error message to display
 * @param {boolean} props.success - Whether input shows success state
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {boolean} props.clearable - Whether to show clear button
 * @param {boolean} props.loading - Whether input is in loading state
 * @param {number} props.debounceMs - Debounce delay for onChange
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onClear - Clear button handler
 * @param {Function} props.onFocus - Focus handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
export const Input = forwardRef(({
  type = 'text',
  size = 'md',
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  invalid = false,
  error = '',
  success = false,
  leftIcon = null,
  rightIcon = null,
  clearable = false,
  loading = false,
  debounceMs = 0,
  onChange,
  onClear,
  onFocus,
  onBlur,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const { getTransition } = useTheme();
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // Use provided ref or internal ref
  const actualRef = ref || inputRef;

  // Determine if this is a controlled component
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;

  // Clear the debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Debounced change handler
  const debouncedOnChange = useCallback((newValue, event) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (debounceMs > 0) {
      debounceRef.current = setTimeout(() => {
        if (onChange) {
          onChange(event);
        }
      }, debounceMs);
    } else if (onChange) {
      onChange(event);
    }
  }, [onChange, debounceMs]);

  // Handle input change
  const handleChange = (event) => {
    const newValue = event.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    debouncedOnChange(newValue, event);
  };

  // Handle focus
  const handleFocus = (event) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(event);
    }
  };

  // Handle blur
  const handleBlur = (event) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(event);
    }
  };

  // Handle clear button
  const handleClear = () => {
    const event = {
      target: { value: '' },
      type: 'change'
    };

    if (!isControlled) {
      setInternalValue('');
    }

    if (onChange) {
      onChange(event);
    }

    if (onClear) {
      onClear();
    }

    // Focus the input after clearing
    if (actualRef.current) {
      actualRef.current.focus();
    }
  };

  // Determine input state
  const inputState = invalid ? 'error' : success ? 'success' : 'default';
  const hasValue = inputValue && inputValue.length > 0;
  const showClearButton = clearable && hasValue && !disabled && !readOnly;

  // Generate CSS classes
  const wrapperClasses = [
    'db-input-wrapper',
    `db-input-wrapper--${size}`,
    `db-input-wrapper--${inputState}`,
    isFocused && 'db-input-wrapper--focused',
    disabled && 'db-input-wrapper--disabled',
    readOnly && 'db-input-wrapper--readonly',
    leftIcon && 'db-input-wrapper--has-left-icon',
    (rightIcon || showClearButton || loading) && 'db-input-wrapper--has-right-icon',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'db-input',
    `db-input--${size}`
  ].filter(Boolean).join(' ');

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="db-input__icon db-input__icon--right db-input__loading">
      <svg className="db-animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
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
  );

  // Clear button component
  const ClearButton = () => (
    <button
      type="button"
      className="db-input__clear"
      onClick={handleClear}
      tabIndex={-1}
      aria-label="Clear input"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );

  return (
    <div className="db-input-container">
      <div className={wrapperClasses} style={style}>
        {/* Left icon */}
        {leftIcon && (
          <div className="db-input__icon db-input__icon--left">
            {leftIcon}
          </div>
        )}

        {/* Input element */}
        <input
          ref={actualRef}
          type={type}
          className={inputClasses}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={invalid}
          aria-describedby={error ? `${rest.id || 'input'}-error` : undefined}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {/* Right side icons/buttons */}
        <div className="db-input__right-content">
          {loading && <LoadingSpinner />}
          {showClearButton && <ClearButton />}
          {rightIcon && !loading && (
            <div className="db-input__icon db-input__icon--right">
              {rightIcon}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div 
          className="db-input__error"
          id={`${rest.id || 'input'}-error`}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;