import { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import './Combobox.css';

/**
 * Material Design 3 Searchable Combobox Component
 * Provides a searchable dropdown with keyboard navigation and accessibility
 */
const Combobox = ({
  options = [],
  value = '',
  placeholder = 'Search...',
  label,
  helperText,
  error = false,
  disabled = false,
  clearable = true,
  multiple = false,
  maxHeight = 300,
  noResultsText = 'No results found',
  loadingText = 'Loading...',
  loading = false,
  className = '',
  onSelectionChange,
  onInputChange,
  renderOption,
  renderSelectedOption,
  getOptionValue = (option) => option?.value || option,
  getOptionLabel = (option) => option?.label || option,
  filterOptions,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedOptions, setSelectedOptions] = useState(multiple ? [] : null);
  
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const optionRefs = useRef({});
  const comboboxId = useRef(`md3-combobox-${Math.random().toString(36).slice(2, 11)}`);

  // Initialize selected options from value prop
  useEffect(() => {
    if (multiple) {
      const selected = Array.isArray(value) ? value : [];
      setSelectedOptions(selected);
    } else {
      setSelectedOptions(value);
    }
  }, [value, multiple]);

  // Filter options based on search value
  const filteredOptions = useMemo(() => {
    if (loading) return [];
    
    if (filterOptions) {
      return filterOptions(options, searchValue);
    }
    
    if (!searchValue.trim()) return options;
    
    return options.filter(option => {
      const label = getOptionLabel(option).toLowerCase();
      return label.includes(searchValue.toLowerCase());
    });
  }, [options, searchValue, filterOptions, getOptionLabel, loading]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    setHighlightedIndex(-1);
    
    if (!isOpen) {
      setIsOpen(true);
    }
    
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (multiple) {
      const optionValue = getOptionValue(option);
      const isSelected = selectedOptions.some(selected => 
        getOptionValue(selected) === optionValue
      );
      
      let newSelection;
      if (isSelected) {
        newSelection = selectedOptions.filter(selected => 
          getOptionValue(selected) !== optionValue
        );
      } else {
        newSelection = [...selectedOptions, option];
      }
      
      setSelectedOptions(newSelection);
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    } else {
      setSelectedOptions(option);
      setSearchValue(getOptionLabel(option));
      setIsOpen(false);
      
      if (onSelectionChange) {
        onSelectionChange(option);
      }
    }
  };

  // Handle clear
  const handleClear = () => {
    if (multiple) {
      setSelectedOptions([]);
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    } else {
      setSelectedOptions(null);
      if (onSelectionChange) {
        onSelectionChange(null);
      }
    }
    setSearchValue('');
    inputRef.current?.focus();
  };

  // Handle remove single option in multiple mode
  const handleRemoveOption = (optionToRemove) => {
    if (!multiple) return;
    
    const newSelection = selectedOptions.filter(option => 
      getOptionValue(option) !== getOptionValue(optionToRemove)
    );
    
    setSelectedOptions(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
        
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          listRef.current && !listRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if option is selected
  const isOptionSelected = (option) => {
    if (multiple) {
      return selectedOptions.some(selected => 
        getOptionValue(selected) === getOptionValue(option)
      );
    }
    return selectedOptions && getOptionValue(selectedOptions) === getOptionValue(option);
  };

  // Get display value for input
  const getDisplayValue = () => {
    if (multiple) {
      return searchValue;
    }
    return searchValue || (selectedOptions ? getOptionLabel(selectedOptions) : '');
  };

  const containerClasses = [
    'md3-combobox',
    className,
    error && 'md3-combobox--error',
    disabled && 'md3-combobox--disabled',
    isOpen && 'md3-combobox--open',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {label && (
        <label htmlFor={comboboxId.current} className="md3-combobox__label">
          {label}
        </label>
      )}
      
      <div className="md3-combobox__container">
        <div className="md3-combobox__input-container">
          {/* Selected options chips for multiple mode */}
          {multiple && selectedOptions.length > 0 && (
            <div className="md3-combobox__chips">
              {selectedOptions.map((option, index) => (
                <div key={getOptionValue(option)} className="md3-combobox__chip">
                  {renderSelectedOption ? renderSelectedOption(option) : getOptionLabel(option)}
                  <button
                    type="button"
                    className="md3-combobox__chip-remove"
                    onClick={() => handleRemoveOption(option)}
                    aria-label={`Remove ${getOptionLabel(option)}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <input
            ref={inputRef}
            id={comboboxId.current}
            type="text"
            className="md3-combobox__input"
            value={getDisplayValue()}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={`${comboboxId.current}-listbox`}
            aria-activedescendant={
              highlightedIndex >= 0 ? `${comboboxId.current}-option-${highlightedIndex}` : undefined
            }
          />
          
          <div className="md3-combobox__actions">
            {clearable && (selectedOptions || searchValue) && (
              <button
                type="button"
                className="md3-combobox__clear"
                onClick={handleClear}
                aria-label="Clear selection"
                disabled={disabled}
              >
                ×
              </button>
            )}
            
            <button
              type="button"
              className="md3-combobox__dropdown-arrow"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close dropdown' : 'Open dropdown'}
              disabled={disabled}
            >
              ⌄
            </button>
          </div>
        </div>
        
        <div className="md3-combobox__state-layer" />
      </div>
      
      {/* Dropdown list */}
      {isOpen && (
        <div
          ref={listRef}
          id={`${comboboxId.current}-listbox`}
          className="md3-combobox__dropdown"
          role="listbox"
          aria-label={label || 'Options'}
          style={{ maxHeight }}
        >
          {loading ? (
            <div className="md3-combobox__loading" role="status">
              <div className="md3-combobox__spinner" />
              {loadingText}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="md3-combobox__no-results" role="status">
              {noResultsText}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={getOptionValue(option)}
                ref={el => optionRefs.current[index] = el}
                id={`${comboboxId.current}-option-${index}`}
                className={[
                  'md3-combobox__option',
                  index === highlightedIndex && 'md3-combobox__option--highlighted',
                  isOptionSelected(option) && 'md3-combobox__option--selected'
                ].filter(Boolean).join(' ')}
                role="option"
                aria-selected={isOptionSelected(option)}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {multiple && (
                  <div className="md3-combobox__option-checkbox">
                    <input
                      type="checkbox"
                      checked={isOptionSelected(option)}
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                )}
                
                <div className="md3-combobox__option-content">
                  {renderOption ? renderOption(option) : getOptionLabel(option)}
                </div>
                
                {!multiple && isOptionSelected(option) && (
                  <div className="md3-combobox__option-check">✓</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
      {helperText && (
        <div className="md3-combobox__helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
};

Combobox.propTypes = {
  options: PropTypes.array,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array
  ]),
  placeholder: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  clearable: PropTypes.bool,
  multiple: PropTypes.bool,
  maxHeight: PropTypes.number,
  noResultsText: PropTypes.string,
  loadingText: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  onSelectionChange: PropTypes.func,
  onInputChange: PropTypes.func,
  renderOption: PropTypes.func,
  renderSelectedOption: PropTypes.func,
  getOptionValue: PropTypes.func,
  getOptionLabel: PropTypes.func,
  filterOptions: PropTypes.func,
};

export default Combobox;