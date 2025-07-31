import React from 'react';

const Slider = ({ 
  min = 0, 
  max = 100, 
  value, 
  onChange, 
  label,
  displayValue,
  className = '',
  ...props 
}) => {
  return (
    <div className="field-row">
      {label && (
        <label className="field-label">
          {label}
          {displayValue && `: ${displayValue}`}
        </label>
      )}
      <input
        type="range"
        className={`slider ${className}`}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default Slider;