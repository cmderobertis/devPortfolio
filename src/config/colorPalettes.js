// Color palette configuration for theme system
export const COLOR_PALETTES = {
  light: {
    blue: {
      name: "Ocean Blue",
      primary: "#1976d2",
      onPrimary: "#ffffff",
      primaryContainer: "#d3e3fd",
      onPrimaryContainer: "#001c3b",
    },
    purple: {
      name: "Royal Purple", 
      primary: "#7c4dff",
      onPrimary: "#ffffff",
      primaryContainer: "#e8ddff",
      onPrimaryContainer: "#1a0033",
    },
    green: {
      name: "Forest Green",
      primary: "#2e7d32", 
      onPrimary: "#ffffff",
      primaryContainer: "#c8e6c9",
      onPrimaryContainer: "#1b5e20",
    },
    orange: {
      name: "Sunset Orange",
      primary: "#ff6f00",
      onPrimary: "#ffffff",
      primaryContainer: "#ffe0b2",
      onPrimaryContainer: "#e65100",
    },
    red: {
      name: "Cherry Red",
      primary: "#d32f2f",
      onPrimary: "#ffffff",
      primaryContainer: "#ffcdd2",
      onPrimaryContainer: "#b71c1c",
    },
    teal: {
      name: "Tropical Teal",
      primary: "#00796b",
      onPrimary: "#ffffff",
      primaryContainer: "#b2dfdb",
      onPrimaryContainer: "#004d40",
    }
  },
  dark: {
    blue: {
      name: "Deep Ocean",
      primary: "#90caf9",
      onPrimary: "#003258",
      primaryContainer: "#004881",
      onPrimaryContainer: "#d3e3fd",
    },
    purple: {
      name: "Mystic Purple",
      primary: "#b388ff",
      onPrimary: "#2d1b69",
      primaryContainer: "#5e35b1",
      onPrimaryContainer: "#e8ddff",
    },
    green: {
      name: "Neon Green", 
      primary: "#81c784",
      onPrimary: "#1b5e20",
      primaryContainer: "#388e3c",
      onPrimaryContainer: "#c8e6c9",
    },
    orange: {
      name: "Amber Glow",
      primary: "#ffb74d",
      onPrimary: "#e65100",
      primaryContainer: "#ff8f00",
      onPrimaryContainer: "#ffe0b2",
    },
    red: {
      name: "Crimson Fire",
      primary: "#ef5350",
      onPrimary: "#b71c1c",
      primaryContainer: "#c62828",
      onPrimaryContainer: "#ffcdd2",
    },
    teal: {
      name: "Cyan Wave",
      primary: "#4db6ac",
      onPrimary: "#004d40",
      primaryContainer: "#00695c",
      onPrimaryContainer: "#b2dfdb",
    }
  }
};

export const DEFAULT_PALETTES = {
  light: "blue",
  dark: "blue"
};

export const getPaletteVariables = (theme, paletteKey) => {
  const palette = COLOR_PALETTES[theme]?.[paletteKey];
  if (!palette) return {};
  
  return {
    '--md-sys-color-primary': palette.primary,
    '--md-sys-color-on-primary': palette.onPrimary,
    '--md-sys-color-primary-container': palette.primaryContainer,
    '--md-sys-color-on-primary-container': palette.onPrimaryContainer,
  };
};