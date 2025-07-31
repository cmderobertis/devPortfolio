import React from 'react';

const FieldRow = ({ children, className = '', ...props }) => {
  return (
    <div className={`field-row ${className}`} {...props}>
      {children}
    </div>
  );
};

const FieldLabel = ({ children, htmlFor, className = '' }) => {
  return (
    <label className={`field-label ${className}`} htmlFor={htmlFor}>
      {children}
    </label>
  );
};

export { FieldRow, FieldLabel };