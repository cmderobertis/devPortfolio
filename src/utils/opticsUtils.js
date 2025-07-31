// Optics and Physics Calculations for Light Dispersion
// Refractive index calculations and optical constants

// Physical constants
export const N_AIR = 1.000293;

// Sellmeier equation coefficients for crown glass
export const SELLMEIER_COEFFICIENTS = {
  B1: 1.03961212,
  C1: 0.00600069867,
  B2: 0.231792344,
  C2: 0.0200179144,
  B3: 1.01046945,
  C3: 103.560653,
};

// Colors and their corresponding wavelengths (in micrometers)
export const COLORS = {
  Violet: 0.405,
  Blue: 0.47,
  Green: 0.52,
  Yellow: 0.588,
  Orange: 0.61,
  Red: 0.65,
};

// Color mapping for visualization
export const COLOR_MAP = {
  Violet: '#8B00FF',
  Blue: '#0080FF',
  Green: '#00FF40',
  Yellow: '#FFFF00',
  Orange: '#FF8000',
  Red: '#FF0000'
};

// Calculate refractive index using Sellmeier equation
export const calculateRefractiveIndex = (wavelengthUm) => {
  const { B1, C1, B2, C2, B3, C3 } = SELLMEIER_COEFFICIENTS;
  const lambdaSq = wavelengthUm ** 2;
  
  const term1 = (B1 * lambdaSq) / (lambdaSq - C1);
  const term2 = (B2 * lambdaSq) / (lambdaSq - C2);
  const term3 = (B3 * lambdaSq) / (lambdaSq - C3);
  
  const nSquared = 1 + term1 + term2 + term3;
  return Math.sqrt(nSquared);
};

// Pre-calculate refractive indices for all visible colors
export const calculateRefractiveIndices = () => {
  return Object.keys(COLORS).reduce((acc, color) => {
    acc[color] = calculateRefractiveIndex(COLORS[color]);
    return acc;
  }, {});
};