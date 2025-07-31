import React from 'react';

const StatusBar = ({ children, className = '' }) => {
  return (
    <div className={`status-bar ${className}`}>
      {children}
    </div>
  );
};

const StatusBarSection = ({ children, className = '' }) => {
  return (
    <div className={`status-bar-field ${className}`}>
      {children}
    </div>
  );
};

export { StatusBar, StatusBarSection };