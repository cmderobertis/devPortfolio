import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'default', // 'default', 'primary'
  className = '',
  style = {},
  ...props 
}) => {
  const baseClass = variant === 'primary' ? 'btn btn-primary' : 'btn';
  
  return (
    <button 
      className={`${baseClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;