import React from 'react';

const Select = ({ 
  options = [], 
  value, 
  onChange, 
  className = '',
  label,
  ...props 
}) => {
  return (
    <div className="field-row">
      {label && <label className="field-label">{label}</label>}
      <select 
        className={`field-select ${className}`}
        value={value}
        onChange={onChange}
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
};

export default Select;