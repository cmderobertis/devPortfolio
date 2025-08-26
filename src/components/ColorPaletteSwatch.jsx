import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import "./ColorPaletteSwatch.css";

const ColorPaletteSwatch = ({ className = "" }) => {
  const {
    resolvedTheme,
    lightPalette,
    darkPalette,
    availablePalettes,
    setLightPalette,
    setDarkPalette
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentPalette = resolvedTheme === 'dark' ? darkPalette : lightPalette;
  const currentPaletteOptions = availablePalettes[resolvedTheme] || {};
  const setPalette = resolvedTheme === 'dark' ? setDarkPalette : setLightPalette;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePaletteChange = (paletteKey) => {
    setPalette(paletteKey);
    setIsOpen(false);
  };

  const handleKeyDown = (event, paletteKey) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePaletteChange(paletteKey);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`color-palette-swatch ${className}`} ref={dropdownRef}>
      <button
        className="swatch-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Color palette: ${currentPaletteOptions[currentPalette]?.name || currentPalette}`}
        title="Change color palette"
      >
        <div className="swatch-preview">
          <div 
            className="swatch-color" 
            style={{ backgroundColor: currentPaletteOptions[currentPalette]?.primary || '#1976d2' }}
          />
        </div>
        <svg
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="swatch-dropdown" role="listbox">
          {Object.entries(currentPaletteOptions).map(([key, palette]) => (
            <button
              key={key}
              className={`swatch-option ${key === currentPalette ? 'active' : ''}`}
              onClick={() => handlePaletteChange(key)}
              onKeyDown={(e) => handleKeyDown(e, key)}
              role="option"
              aria-selected={key === currentPalette}
              tabIndex={0}
            >
              <div 
                className="option-color" 
                style={{ backgroundColor: palette.primary }}
              />
              <span className="option-name">{palette.name}</span>
              {key === currentPalette && (
                <svg className="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.5 4.5L6 12L2.5 8.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPaletteSwatch;