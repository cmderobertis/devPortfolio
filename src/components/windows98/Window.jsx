import React from 'react';

const Window = ({ 
  title, 
  children, 
  onMinimize, 
  onMaximize, 
  onClose, 
  className = '',
  style = {},
  resizable = false 
}) => {
  return (
    <div className={`window ${className}`} style={style}>
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          {onMinimize && (
            <button 
              className="title-bar-control" 
              aria-label="Minimize"
              onClick={onMinimize}
            >
              &#x2212;
            </button>
          )}
          {onMaximize && (
            <button 
              className="title-bar-control" 
              aria-label="Maximize"
              onClick={onMaximize}
            >
              &#x25A1;
            </button>
          )}
          {onClose && (
            <button 
              className="title-bar-control" 
              aria-label="Close"
              onClick={onClose}
            >
              &#x2715;
            </button>
          )}
        </div>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
};

export default Window;