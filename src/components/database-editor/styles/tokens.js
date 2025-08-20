/**
 * Design Tokens for Database Editor
 * Centralized design system values for consistent theming
 */

export const designTokens = {
  // Color System
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },

    // Grayscale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712'
    },

    // Data type colors
    dataTypes: {
      string: {
        light: '#10b981',
        dark: '#059669',
        bg: '#d1fae5',
        text: '#065f46'
      },
      number: {
        light: '#f59e0b',
        dark: '#d97706',
        bg: '#fef3c7',
        text: '#92400e'
      },
      boolean: {
        light: '#8b5cf6',
        dark: '#7c3aed',
        bg: '#ede9fe',
        text: '#5b21b6'
      },
      date: {
        light: '#06b6d4',
        dark: '#0891b2',
        bg: '#cffafe',
        text: '#155e75'
      },
      json: {
        light: '#f97316',
        dark: '#ea580c',
        bg: '#fed7aa',
        text: '#9a3412'
      },
      array: {
        light: '#ec4899',
        dark: '#db2777',
        bg: '#fce7f3',
        text: '#be185d'
      },
      null: {
        light: '#6b7280',
        dark: '#4b5563',
        bg: '#f3f4f6',
        text: '#374151'
      }
    },

    // Status colors
    status: {
      success: {
        light: '#10b981',
        dark: '#059669',
        bg: '#d1fae5',
        text: '#065f46'
      },
      warning: {
        light: '#f59e0b',
        dark: '#d97706',
        bg: '#fef3c7',
        text: '#92400e'
      },
      error: {
        light: '#ef4444',
        dark: '#dc2626',
        bg: '#fee2e2',
        text: '#991b1b'
      },
      info: {
        light: '#3b82f6',
        dark: '#2563eb',
        bg: '#dbeafe',
        text: '#1d4ed8'
      }
    },

    // Relationship confidence colors
    confidence: {
      high: '#10b981',     // green
      medium: '#f59e0b',   // amber
      low: '#f97316',      // orange
      veryLow: '#ef4444'   // red
    },

    // Surface colors
    surface: {
      background: '#ffffff',
      card: '#ffffff',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
      border: '#e5e7eb',
      divider: '#f3f4f6'
    }
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem'      // 48px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  },

  // Spacing Scale
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem'     // 256px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Shadows
  boxShadow: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
  },

  // Z-index scale
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
    toast: '1070'
  },

  // Transitions
  transition: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        xs: '1.5rem',   // 24px
        sm: '2rem',     // 32px
        md: '2.5rem',   // 40px
        lg: '3rem',     // 48px
        xl: '3.5rem'    // 56px
      },
      padding: {
        xs: '0.25rem 0.5rem',
        sm: '0.375rem 0.75rem',
        md: '0.5rem 1rem',
        lg: '0.625rem 1.25rem',
        xl: '0.75rem 1.5rem'
      }
    },
    input: {
      height: {
        sm: '2rem',     // 32px
        md: '2.5rem',   // 40px
        lg: '3rem'      // 48px
      },
      padding: {
        sm: '0.375rem 0.75rem',
        md: '0.5rem 0.75rem',
        lg: '0.625rem 1rem'
      }
    },
    card: {
      padding: {
        sm: '1rem',     // 16px
        md: '1.5rem',   // 24px
        lg: '2rem'      // 32px
      }
    }
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Helper functions for accessing tokens
export const getDataTypeColor = (dataType, variant = 'light') => {
  return designTokens.colors.dataTypes[dataType]?.[variant] || designTokens.colors.dataTypes.string[variant];
};

export const getStatusColor = (status, variant = 'light') => {
  return designTokens.colors.status[status]?.[variant] || designTokens.colors.status.info[variant];
};

export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return designTokens.colors.confidence.high;
  if (confidence >= 0.6) return designTokens.colors.confidence.medium;
  if (confidence >= 0.4) return designTokens.colors.confidence.low;
  return designTokens.colors.confidence.veryLow;
};

// CSS custom properties generator
export const generateCSSCustomProperties = () => {
  const cssVars = {};
  
  // Flatten color tokens
  Object.entries(designTokens.colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'object') {
      Object.entries(colorValue).forEach(([shade, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([variant, color]) => {
            cssVars[`--color-${colorName}-${shade}-${variant}`] = color;
          });
        } else {
          cssVars[`--color-${colorName}-${shade}`] = value;
        }
      });
    } else {
      cssVars[`--color-${colorName}`] = colorValue;
    }
  });

  // Flatten spacing tokens
  Object.entries(designTokens.spacing).forEach(([size, value]) => {
    cssVars[`--spacing-${size}`] = value;
  });

  // Flatten typography tokens
  Object.entries(designTokens.typography.fontSize).forEach(([size, value]) => {
    cssVars[`--font-size-${size}`] = value;
  });

  return cssVars;
};

export default designTokens;