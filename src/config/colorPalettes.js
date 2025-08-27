// Enhanced Color palette configuration with Material 3 baseline color schemes

// Color scheme categories for better organization
export const COLOR_SCHEME_CATEGORIES = {
  NEUTRAL: 'neutral',
  VIBRANT: 'vibrant', 
  NATURE: 'nature',
  PROFESSIONAL: 'professional',
  CLASSIC: 'classic'
};

// Extended color palettes with categories and metadata
export const COLOR_PALETTES = {
  light: {
    // Classic Material Design Colors
    blue: {
      name: "Ocean Blue",
      category: COLOR_SCHEME_CATEGORIES.CLASSIC,
      primary: "#1976d2",
      onPrimary: "#ffffff",
      primaryContainer: "#d3e3fd",
      onPrimaryContainer: "#001c3b",
      secondary: "#565e71",
      onSecondary: "#ffffff",
      secondaryContainer: "#dae2f9",
      onSecondaryContainer: "#131c2b",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Professional and trustworthy, perfect for business applications"
    },
    purple: {
      name: "Royal Purple", 
      category: COLOR_SCHEME_CATEGORIES.VIBRANT,
      primary: "#7c4dff",
      onPrimary: "#ffffff",
      primaryContainer: "#e8ddff",
      onPrimaryContainer: "#1a0033",
      secondary: "#625b71",
      onSecondary: "#ffffff",
      secondaryContainer: "#e8def8",
      onSecondaryContainer: "#1e192b",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Creative and inspiring, ideal for artistic and innovative projects"
    },
    green: {
      name: "Forest Green",
      category: COLOR_SCHEME_CATEGORIES.NATURE,
      primary: "#2e7d32", 
      onPrimary: "#ffffff",
      primaryContainer: "#c8e6c9",
      onPrimaryContainer: "#1b5e20",
      secondary: "#52634f",
      onSecondary: "#ffffff",
      secondaryContainer: "#d5e8d0",
      onSecondaryContainer: "#101f0f",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Natural and sustainable, perfect for environmental themes"
    },
    orange: {
      name: "Sunset Orange",
      category: COLOR_SCHEME_CATEGORIES.VIBRANT,
      primary: "#ff6f00",
      onPrimary: "#ffffff",
      primaryContainer: "#ffe0b2",
      onPrimaryContainer: "#e65100",
      secondary: "#77624c",
      onSecondary: "#ffffff",
      secondaryContainer: "#ffe0ca",
      onSecondaryContainer: "#2b1700",
      accessibility: { contrast: "AA", wcag: "2.1" },
      description: "Energetic and warm, great for creative and dynamic content"
    },
    red: {
      name: "Cherry Red",
      category: COLOR_SCHEME_CATEGORIES.VIBRANT,
      primary: "#d32f2f",
      onPrimary: "#ffffff",
      primaryContainer: "#ffcdd2",
      onPrimaryContainer: "#b71c1c",
      secondary: "#775652",
      onSecondary: "#ffffff",
      secondaryContainer: "#ffdad6",
      onSecondaryContainer: "#2c1512",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Bold and attention-grabbing, perfect for important alerts and CTAs"
    },
    teal: {
      name: "Tropical Teal",
      category: COLOR_SCHEME_CATEGORIES.NATURE,
      primary: "#00796b",
      onPrimary: "#ffffff",
      primaryContainer: "#b2dfdb",
      onPrimaryContainer: "#004d40",
      secondary: "#4f6356",
      onSecondary: "#ffffff",
      secondaryContainer: "#d1e8d8",
      onSecondaryContainer: "#0c1f15",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Calm and refreshing, ideal for wellness and healthcare applications"
    },
    
    // New Baseline Color Schemes - Neutral
    slate: {
      name: "Neutral Slate",
      category: COLOR_SCHEME_CATEGORIES.NEUTRAL,
      primary: "#475569",
      onPrimary: "#ffffff",
      primaryContainer: "#e2e8f0",
      onPrimaryContainer: "#1e293b",
      secondary: "#64748b",
      onSecondary: "#ffffff",
      secondaryContainer: "#f1f5f9",
      onSecondaryContainer: "#334155",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Clean and minimal, perfect for professional interfaces"
    },
    stone: {
      name: "Warm Stone",
      category: COLOR_SCHEME_CATEGORIES.NEUTRAL,
      primary: "#78716c",
      onPrimary: "#ffffff",
      primaryContainer: "#f5f5f4",
      onPrimaryContainer: "#292524",
      secondary: "#a8a29e",
      onSecondary: "#ffffff",
      secondaryContainer: "#fafaf9",
      onSecondaryContainer: "#44403c",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Sophisticated and timeless, ideal for luxury and premium brands"
    },
    
    // Professional Schemes
    indigo: {
      name: "Corporate Indigo",
      category: COLOR_SCHEME_CATEGORIES.PROFESSIONAL,
      primary: "#3949ab",
      onPrimary: "#ffffff",
      primaryContainer: "#e8eaf6",
      onPrimaryContainer: "#1a237e",
      secondary: "#5c6bc0",
      onSecondary: "#ffffff",
      secondaryContainer: "#e3f2fd",
      onSecondaryContainer: "#283593",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Corporate and trustworthy, excellent for business dashboards"
    },
    navy: {
      name: "Deep Navy",
      category: COLOR_SCHEME_CATEGORIES.PROFESSIONAL,
      primary: "#1565c0",
      onPrimary: "#ffffff",
      primaryContainer: "#e3f2fd",
      onPrimaryContainer: "#0d47a1",
      secondary: "#42a5f5",
      onSecondary: "#ffffff",
      secondaryContainer: "#e1f5fe",
      onSecondaryContainer: "#0277bd",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Authoritative and reliable, perfect for financial and legal applications"
    },
    
    // Nature-inspired Schemes
    sage: {
      name: "Garden Sage",
      category: COLOR_SCHEME_CATEGORIES.NATURE,
      primary: "#689f38",
      onPrimary: "#ffffff",
      primaryContainer: "#dcedc8",
      onPrimaryContainer: "#33691e",
      secondary: "#8bc34a",
      onSecondary: "#ffffff",
      secondaryContainer: "#f1f8e9",
      onSecondaryContainer: "#558b2f",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Organic and peaceful, great for wellness and lifestyle applications"
    },
    lavender: {
      name: "Soft Lavender",
      category: COLOR_SCHEME_CATEGORIES.NATURE,
      primary: "#7e57c2",
      onPrimary: "#ffffff",
      primaryContainer: "#ede7f6",
      onPrimaryContainer: "#4527a0",
      secondary: "#9575cd",
      onSecondary: "#ffffff",
      secondaryContainer: "#f3e5f5",
      onSecondaryContainer: "#6a1b9a",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Calming and elegant, ideal for meditation and wellness apps"
    }
  },
  dark: {
    // Classic Dark Variants
    blue: {
      name: "Deep Ocean",
      category: COLOR_SCHEME_CATEGORIES.CLASSIC,
      primary: "#90caf9",
      onPrimary: "#003258",
      primaryContainer: "#004881",
      onPrimaryContainer: "#d3e3fd",
      secondary: "#bec6dc",
      onSecondary: "#283141",
      secondaryContainer: "#3e4759",
      onSecondaryContainer: "#dae2f9",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Professional night mode with excellent readability"
    },
    purple: {
      name: "Mystic Purple",
      category: COLOR_SCHEME_CATEGORIES.VIBRANT,
      primary: "#b388ff",
      onPrimary: "#2d1b69",
      primaryContainer: "#5e35b1",
      onPrimaryContainer: "#e8ddff",
      secondary: "#ccc2dc",
      onSecondary: "#332d41",
      secondaryContainer: "#4a4458",
      onSecondaryContainer: "#e8def8",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Creative dark theme with rich purple tones"
    },
    green: {
      name: "Neon Green", 
      category: COLOR_SCHEME_CATEGORIES.NATURE,
      primary: "#81c784",
      onPrimary: "#1b5e20",
      primaryContainer: "#388e3c",
      onPrimaryContainer: "#c8e6c9",
      secondary: "#c4ccb8",
      onSecondary: "#2f3e2a",
      secondaryContainer: "#455240",
      onSecondaryContainer: "#e0ecd4",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Natural dark theme perfect for environmental apps"
    },
    orange: {
      name: "Amber Glow",
      category: COLOR_SCHEME_CATEGORIES.VIBRANT,
      primary: "#ffb74d",
      onPrimary: "#e65100",
      primaryContainer: "#ff8f00",
      onPrimaryContainer: "#ffe0b2",
      secondary: "#e4c2a0",
      onSecondary: "#3e2d1c",
      secondaryContainer: "#564131",
      onSecondaryContainer: "#ffdcb5",
      accessibility: { contrast: "AA", wcag: "2.1" },
      description: "Warm and inviting dark theme with golden accents"
    },
    red: {
      name: "Crimson Fire",
      category: COLOR_SCHEME_CATEGORIES.VIBRANT,
      primary: "#ef5350",
      onPrimary: "#b71c1c",
      primaryContainer: "#c62828",
      onPrimaryContainer: "#ffcdd2",
      secondary: "#e7bdb6",
      onSecondary: "#442927",
      secondaryContainer: "#5d3f3c",
      onSecondaryContainer: "#ffdad6",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Bold dark theme for high-impact applications"
    },
    teal: {
      name: "Cyan Wave",
      category: COLOR_SCHEME_CATEGORIES.NATURE,
      primary: "#4db6ac",
      onPrimary: "#004d40",
      primaryContainer: "#00695c",
      onPrimaryContainer: "#b2dfdb",
      secondary: "#b0ccc5",
      onSecondary: "#1c352d",
      secondaryContainer: "#325043",
      onSecondaryContainer: "#cbebe1",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Refreshing dark theme with aquatic vibes"
    },
    
    // New Baseline Dark Schemes - Neutral
    slate: {
      name: "Dark Slate",
      category: COLOR_SCHEME_CATEGORIES.NEUTRAL,
      primary: "#94a3b8",
      onPrimary: "#1e293b",
      primaryContainer: "#334155",
      onPrimaryContainer: "#e2e8f0",
      secondary: "#cbd5e1",
      onSecondary: "#475569",
      secondaryContainer: "#64748b",
      onSecondaryContainer: "#f1f5f9",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Sophisticated dark neutral theme for professional interfaces"
    },
    stone: {
      name: "Dark Stone",
      category: COLOR_SCHEME_CATEGORIES.NEUTRAL,
      primary: "#d6d3d1",
      onPrimary: "#292524",
      primaryContainer: "#44403c",
      onPrimaryContainer: "#f5f5f4",
      secondary: "#e7e5e4",
      onSecondary: "#57534e",
      secondaryContainer: "#78716c",
      onSecondaryContainer: "#fafaf9",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Warm dark neutral theme with premium feel"
    },
    
    // Professional Dark Schemes
    indigo: {
      name: "Dark Corporate",
      category: COLOR_SCHEME_CATEGORIES.PROFESSIONAL,
      primary: "#7986cb",
      onPrimary: "#1a237e",
      primaryContainer: "#283593",
      onPrimaryContainer: "#e8eaf6",
      secondary: "#9fa8da",
      onSecondary: "#303f9f",
      secondaryContainer: "#3f51b5",
      onSecondaryContainer: "#e3f2fd",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Professional dark theme for business applications"
    },
    navy: {
      name: "Midnight Navy",
      category: COLOR_SCHEME_CATEGORIES.PROFESSIONAL,
      primary: "#64b5f6",
      onPrimary: "#0d47a1",
      primaryContainer: "#1976d2",
      onPrimaryContainer: "#e3f2fd",
      secondary: "#81d4fa",
      onSecondary: "#0277bd",
      secondaryContainer: "#0288d1",
      onSecondaryContainer: "#e1f5fe",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Authoritative dark theme for financial interfaces"
    },
    
    // Nature-inspired Dark Schemes
    sage: {
      name: "Dark Sage",
      category: COLOR_SCHEME_CATEGORIES.NATURE,
      primary: "#9ccc65",
      onPrimary: "#33691e",
      primaryContainer: "#558b2f",
      onPrimaryContainer: "#dcedc8",
      secondary: "#c5e1a5",
      onSecondary: "#689f38",
      secondaryContainer: "#7cb342",
      onSecondaryContainer: "#f1f8e9",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Natural dark theme with organic green tones"
    },
    lavender: {
      name: "Dark Lavender",
      category: COLOR_SCHEME_CATEGORIES.NATURE,
      primary: "#b39ddb",
      onPrimary: "#4527a0",
      primaryContainer: "#6a1b9a",
      onPrimaryContainer: "#ede7f6",
      secondary: "#ce93d8",
      onSecondary: "#7b1fa2",
      secondaryContainer: "#8e24aa",
      onSecondaryContainer: "#f3e5f5",
      accessibility: { contrast: "AAA", wcag: "2.1" },
      description: "Calming dark theme with soft purple undertones"
    }
  }
};

// Export color scheme metadata for easy access
export const COLOR_SCHEME_METADATA = {
  totalSchemes: {
    light: Object.keys(COLOR_PALETTES.light).length,
    dark: Object.keys(COLOR_PALETTES.dark).length
  },
  categories: Object.values(COLOR_SCHEME_CATEGORIES),
  accessibilityLevels: ['AAA', 'AA', 'A']
};

export const DEFAULT_PALETTES = {
  light: "blue",
  dark: "blue"
};

// Hue-based mappings between light and dark mode schemes
// Each light mode scheme is mapped to its closest dark mode equivalent based on hue
export const LIGHT_DARK_MAPPINGS = {
  // Blues - Ocean themes
  blue: "blue",           // Ocean Blue → Deep Ocean
  navy: "navy",           // Deep Navy → Midnight Navy
  indigo: "indigo",       // Corporate Indigo → Dark Corporate
  
  // Purples - Mystical themes
  purple: "purple",       // Royal Purple → Mystic Purple  
  lavender: "lavender",   // Soft Lavender → Dark Lavender
  
  // Greens - Nature themes
  green: "green",         // Forest Green → Neon Green
  sage: "sage",           // Garden Sage → Dark Sage
  teal: "teal",          // Tropical Teal → Cyan Wave
  
  // Warm colors - Energy themes
  orange: "orange",       // Sunset Orange → Amber Glow
  red: "red",            // Cherry Red → Crimson Fire
  
  // Neutrals - Professional themes
  slate: "slate",        // Neutral Slate → Dark Slate
  stone: "stone"         // Warm Stone → Dark Stone
};

// Reverse mapping for dark to light mode transitions
export const DARK_LIGHT_MAPPINGS = Object.entries(LIGHT_DARK_MAPPINGS).reduce((acc, [light, dark]) => {
  acc[dark] = light;
  return acc;
}, {});

// Enhanced palette variable generator with full MD3 token support
export const getPaletteVariables = (theme, paletteKey) => {
  const palette = COLOR_PALETTES[theme]?.[paletteKey];
  if (!palette) return {};
  
  return {
    // Primary colors
    '--md-sys-color-primary': palette.primary,
    '--md-sys-color-on-primary': palette.onPrimary,
    '--md-sys-color-primary-container': palette.primaryContainer,
    '--md-sys-color-on-primary-container': palette.onPrimaryContainer,
    
    // Secondary colors (if available)
    ...(palette.secondary && {
      '--md-sys-color-secondary': palette.secondary,
      '--md-sys-color-on-secondary': palette.onSecondary,
      '--md-sys-color-secondary-container': palette.secondaryContainer,
      '--md-sys-color-on-secondary-container': palette.onSecondaryContainer,
    })
  };
};

// Utility functions for color scheme management
export const getColorSchemesByCategory = (theme, category) => {
  const schemes = COLOR_PALETTES[theme] || {};
  return Object.entries(schemes)
    .filter(([, palette]) => palette.category === category)
    .reduce((acc, [key, palette]) => {
      acc[key] = palette;
      return acc;
    }, {});
};

export const getAllCategories = () => {
  return Object.values(COLOR_SCHEME_CATEGORIES);
};

export const getCategoryDisplayName = (category) => {
  const names = {
    [COLOR_SCHEME_CATEGORIES.NEUTRAL]: 'Neutral',
    [COLOR_SCHEME_CATEGORIES.VIBRANT]: 'Vibrant',
    [COLOR_SCHEME_CATEGORIES.NATURE]: 'Nature',
    [COLOR_SCHEME_CATEGORIES.PROFESSIONAL]: 'Professional',
    [COLOR_SCHEME_CATEGORIES.CLASSIC]: 'Classic'
  };
  return names[category] || category;
};

export const getSchemeMetadata = (theme, paletteKey) => {
  const palette = COLOR_PALETTES[theme]?.[paletteKey];
  if (!palette) return null;
  
  return {
    name: palette.name,
    category: palette.category,
    description: palette.description,
    accessibility: palette.accessibility
  };
};

// Color scheme validation utilities
export const validateColorScheme = (scheme) => {
  const requiredFields = ['name', 'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer'];
  return requiredFields.every(field => scheme[field]);
};

export const getAccessibilityLevel = (scheme) => {
  return scheme.accessibility?.contrast || 'Unknown';
};

// Mapping utilities for theme switching with hue preservation
export const getMappedScheme = (currentTheme, currentScheme, targetTheme) => {
  if (currentTheme === targetTheme) {
    return currentScheme;
  }
  
  if (currentTheme === 'light' && targetTheme === 'dark') {
    return LIGHT_DARK_MAPPINGS[currentScheme] || currentScheme;
  }
  
  if (currentTheme === 'dark' && targetTheme === 'light') {
    return DARK_LIGHT_MAPPINGS[currentScheme] || currentScheme;
  }
  
  return currentScheme;
};

export const getOpposingScheme = (currentTheme, currentScheme) => {
  const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
  return getMappedScheme(currentTheme, currentScheme, targetTheme);
};

export const getAllMappedPairs = () => {
  return Object.entries(LIGHT_DARK_MAPPINGS).map(([lightScheme, darkScheme]) => ({
    light: {
      key: lightScheme,
      ...COLOR_PALETTES.light[lightScheme]
    },
    dark: {
      key: darkScheme,
      ...COLOR_PALETTES.dark[darkScheme]
    }
  }));
};