import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';

/**
 * Theme Variant Context for specialized component theming
 */
const ThemeVariantContext = createContext();

/**
 * Custom hook to use theme variant context
 */
export const useThemeVariant = () => {
  const context = useContext(ThemeVariantContext);
  if (!context) {
    // Return default variant if not within a provider
    return {
      variant: 'default',
      getVariantClass: (baseClass) => baseClass,
      isVariant: (variantName) => variantName === 'default'
    };
  }
  return context;
};

/**
 * Theme Variant Provider for specialized component styling
 * 
 * Supports theme variants like:
 * - 'default': Standard Material Design 3
 * - 'minimal': Ultra-clean reduced visual weight
 * - 'neon': Cyberpunk/neon themed
 */
const ThemeVariantProvider = ({ children, variant = 'default' }) => {
  const { theme } = useTheme(); // Get base theme (light/dark)

  // Generate variant-specific CSS classes
  const getVariantClass = (baseClass) => {
    if (variant === 'default') {
      return baseClass;
    }
    return `${baseClass} ${baseClass}--${variant}`;
  };

  // Check if current variant matches
  const isVariant = (variantName) => variant === variantName;

  // Get theme-aware variant class (combines base theme + variant)
  const getThemeVariantClass = (baseClass) => {
    const variantClass = getVariantClass(baseClass);
    return `${variantClass} ${variantClass}--theme-${theme}`;
  };

  const contextValue = {
    variant,
    theme,
    getVariantClass,
    getThemeVariantClass,
    isVariant,
    
    // Convenience checks
    isDefault: variant === 'default',
    isMinimal: variant === 'minimal',
    isNeon: variant === 'neon',
  };

  return (
    <ThemeVariantContext.Provider value={contextValue}>
      <div className={`theme-variant theme-variant--${variant} theme-variant--${variant}-${theme}`}>
        {children}
      </div>
    </ThemeVariantContext.Provider>
  );
};

ThemeVariantProvider.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'minimal', 'neon']),
};

export default ThemeVariantProvider;