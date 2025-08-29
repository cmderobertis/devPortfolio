/**
 * Color contrast validation utilities
 * Implements WCAG 2.1 AA color contrast requirements
 */

/**
 * Convert hex color to RGB values
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB values to relative luminance
 * Formula from WCAG 2.1 specification
 */
const getLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export const calculateContrastRatio = (color1, color2) => {
  const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
  const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Validate color contrast against WCAG 2.1 standards
 */
export const validateColorContrast = (foreground, background, fontSize = 16, isBold = false) => {
  const contrast = calculateContrastRatio(foreground, background);
  
  // Large text: 18pt+ or 14pt+ bold (approximately 24px+ or 18px+ bold)
  const isLargeText = fontSize >= 24 || (fontSize >= 18 && isBold);
  
  return {
    ratio: contrast,
    AA: isLargeText ? contrast >= 3 : contrast >= 4.5,
    AAA: isLargeText ? contrast >= 4.5 : contrast >= 7,
    isLargeText,
    level: contrast >= 7 ? 'AAA' : 
           contrast >= 4.5 ? 'AA' : 
           contrast >= 3 ? 'AA Large' : 'Fail'
  };
};

/**
 * Get computed CSS color value from element
 */
export const getComputedColor = (element, property = 'color') => {
  const style = window.getComputedStyle(element);
  const color = style.getPropertyValue(property);
  
  // Convert rgb/rgba to hex for consistency
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return {
      r: parseInt(r),
      g: parseInt(g),
      b: parseInt(b)
    };
  }
  
  return hexToRgb(color);
};

/**
 * Audit color contrast for an element
 */
export const auditElementContrast = (element) => {
  const style = window.getComputedStyle(element);
  const foreground = getComputedColor(element, 'color');
  const background = getComputedColor(element, 'background-color');
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = style.fontWeight;
  const isBold = fontWeight === 'bold' || parseInt(fontWeight) >= 700;
  
  if (!foreground || !background) {
    return null;
  }
  
  return validateColorContrast(foreground, background, fontSize, isBold);
};

/**
 * Audit all text elements on the page for contrast violations
 */
export const auditPageContrast = () => {
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, input, textarea, label');
  const violations = [];
  
  textElements.forEach(element => {
    const result = auditElementContrast(element);
    if (result && !result.AA) {
      violations.push({
        element,
        contrast: result,
        selector: generateSelector(element)
      });
    }
  });
  
  return violations;
};

/**
 * Generate a CSS selector for an element
 */
const generateSelector = (element) => {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    return `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
  }
  
  return element.tagName.toLowerCase();
};

/**
 * Suggest improved colors that meet contrast requirements
 */
export const suggestContrastFix = (foreground, background, targetLevel = 'AA') => {
  const targetRatio = targetLevel === 'AAA' ? 7 : 4.5;
  const currentRatio = calculateContrastRatio(foreground, background);
  
  if (currentRatio >= targetRatio) {
    return { foreground, background, improved: false };
  }
  
  // Simple approach: darken foreground or lighten background
  const fgRgb = typeof foreground === 'string' ? hexToRgb(foreground) : foreground;
  const bgRgb = typeof background === 'string' ? hexToRgb(background) : background;
  
  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  if (fgLum > bgLum) {
    // Foreground is lighter, darken it
    const factor = Math.sqrt(targetRatio / currentRatio);
    return {
      foreground: {
        r: Math.max(0, Math.floor(fgRgb.r * factor)),
        g: Math.max(0, Math.floor(fgRgb.g * factor)),
        b: Math.max(0, Math.floor(fgRgb.b * factor))
      },
      background: bgRgb,
      improved: true
    };
  } else {
    // Background is lighter, lighten it more
    const factor = Math.sqrt(targetRatio / currentRatio);
    return {
      foreground: fgRgb,
      background: {
        r: Math.min(255, Math.floor(bgRgb.r / factor)),
        g: Math.min(255, Math.floor(bgRgb.g / factor)),
        b: Math.min(255, Math.floor(bgRgb.b / factor))
      },
      improved: true
    };
  }
};