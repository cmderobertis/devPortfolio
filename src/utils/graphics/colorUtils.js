// Color and Paint Utilities
// Extracted from DuckKonundrum.jsx and other color-related functions

// Get color hex values for Duck Konundrum paint cans
export const getColorHex = (colorName) => {
  const colors = {
    'Red': '#e74c3c',
    'Blue': '#3498db', 
    'Green': '#27ae60',
    'Yellow': '#f1c40f',
    'Purple': '#9b59b6'
  };
  return colors[colorName] || '#95a5a6';
};

// Mix paint colors for Duck Konundrum
export const mixPaint = (color1, color2) => {
  const mixMap = {
    'Red+Blue': '#8e44ad',
    'Blue+Red': '#8e44ad',
    'Red+Yellow': '#e67e22',
    'Yellow+Red': '#e67e22',
    'Blue+Yellow': '#16a085',
    'Yellow+Blue': '#16a085',
    'Red+Green': '#795548',
    'Green+Red': '#795548',
    'Blue+Green': '#607d8b',
    'Green+Blue': '#607d8b',
    'Yellow+Green': '#8bc34a',
    'Green+Yellow': '#8bc34a'
  };
  
  return mixMap[`${color1}+${color2}`] || getColorHex(color1);
};

// General color manipulation utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Create rgba string with alpha
export const createRgbaString = (color, alpha = 1) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

// Lighten or darken a color by percentage
export const adjustBrightness = (hex, percent) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjust = (value) => {
    const adjusted = Math.round(value * (1 + percent / 100));
    return Math.max(0, Math.min(255, adjusted));
  };
  
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
};

// Get contrasting text color (black or white) for a background
export const getContrastingColor = (backgroundColor) => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Generate random hex color
export const getRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

// Color palette generators
export const generateColorPalette = (baseColor, count = 5) => {
  const colors = [];
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [baseColor];
  
  for (let i = 0; i < count; i++) {
    const factor = (i / (count - 1)) * 0.8 + 0.1; // 0.1 to 0.9
    const r = Math.round(rgb.r * factor);
    const g = Math.round(rgb.g * factor);
    const b = Math.round(rgb.b * factor);
    colors.push(rgbToHex(r, g, b));
  }
  
  return colors;
};