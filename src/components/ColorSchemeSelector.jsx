import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  COLOR_PALETTES, 
  getColorSchemesByCategory, 
  getAllCategories, 
  getCategoryDisplayName, 
  getSchemeMetadata 
} from '../config/colorPalettes';
import './ColorSchemeSelector.css';

const ColorSchemeSelector = ({ isOpen, onClose }) => {
  const { 
    resolvedTheme, 
    lightPalette, 
    darkPalette, 
    setLightPalette, 
    setDarkPalette,
    currentPalette 
  } = useTheme();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewScheme, setPreviewScheme] = useState(null);
  
  const categories = getAllCategories();
  const currentSchemes = resolvedTheme === 'dark' ? 
    COLOR_PALETTES.dark : COLOR_PALETTES.light;
  
  const filteredSchemes = activeCategory === 'all' ? 
    currentSchemes : 
    getColorSchemesByCategory(resolvedTheme, activeCategory);

  const handleSchemeSelect = (schemeKey) => {
    if (resolvedTheme === 'dark') {
      setDarkPalette(schemeKey);
    } else {
      setLightPalette(schemeKey);
    }
    onClose();
  };

  const handlePreview = (schemeKey) => {
    setPreviewScheme(schemeKey);
  };

  const clearPreview = () => {
    setPreviewScheme(null);
  };

  const getDisplayScheme = (schemeKey) => {
    return previewScheme === schemeKey ? 
      currentSchemes[schemeKey] : 
      currentSchemes[schemeKey];
  };

  if (!isOpen) return null;

  return (
    <div className="color-scheme-selector-overlay" onClick={onClose}>
      <div className="color-scheme-selector" onClick={(e) => e.stopPropagation()}>
        <div className="selector-header">
          <h2>Choose Color Scheme</h2>
          <p className="theme-indicator">
            {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} Schemes
          </p>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="category-tabs">
          <button 
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Schemes
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {getCategoryDisplayName(category)}
            </button>
          ))}
        </div>

        <div className="schemes-grid">
          {Object.entries(filteredSchemes).map(([schemeKey, scheme]) => {
            const isActive = currentPalette === schemeKey;
            const metadata = getSchemeMetadata(resolvedTheme, schemeKey);
            
            return (
              <div
                key={schemeKey}
                className={`scheme-card ${isActive ? 'active' : ''}`}
                onClick={() => handleSchemeSelect(schemeKey)}
                onMouseEnter={() => handlePreview(schemeKey)}
                onMouseLeave={clearPreview}
              >
                <div className="scheme-preview">
                  <div className="color-row">
                    <div 
                      className="color-swatch primary"
                      style={{ backgroundColor: scheme.primary }}
                      title="Primary"
                    />
                    <div 
                      className="color-swatch primary-container"
                      style={{ backgroundColor: scheme.primaryContainer }}
                      title="Primary Container"
                    />
                  </div>
                  {scheme.secondary && (
                    <div className="color-row">
                      <div 
                        className="color-swatch secondary"
                        style={{ backgroundColor: scheme.secondary }}
                        title="Secondary"
                      />
                      <div 
                        className="color-swatch secondary-container"
                        style={{ backgroundColor: scheme.secondaryContainer }}
                        title="Secondary Container"
                      />
                    </div>
                  )}
                </div>
                
                <div className="scheme-info">
                  <h3 className="scheme-name">{scheme.name}</h3>
                  <p className="scheme-category">
                    {getCategoryDisplayName(scheme.category)}
                  </p>
                  <p className="scheme-description">
                    {scheme.description}
                  </p>
                  
                  <div className="scheme-metadata">
                    <span className={`accessibility-badge ${scheme.accessibility.contrast.toLowerCase()}`}>
                      {scheme.accessibility.contrast}
                    </span>
                  </div>
                </div>
                
                {isActive && (
                  <div className="active-indicator">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="selector-footer">
          <div className="scheme-count">
            {Object.keys(filteredSchemes).length} schemes available
          </div>
          <div className="current-selection">
            Current: <strong>{currentSchemes[currentPalette]?.name}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSchemeSelector;