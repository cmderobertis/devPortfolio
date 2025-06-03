// src/config/emergencePatterns.js

// Agent counts for different non-cellular simulation patterns
export const agentCountParams = {
  flocking: 80,  // Recommended agent count for flocking simulation
  neurons: 60,   // Recommended agent count for neuron simulation
  economy: 40    // Recommended agent count for economic simulation
  // 'cellular' pattern agent/cell count is determined by grid dimensions
};

// Configuration for 2D Cellular Automata Grids
export const cellularGridConfig = {
  defaultWidth: 60,   // Default width of the 2D cellular grid
  defaultHeight: 40   // Default height of the 2D cellular grid
};

// Configuration for 3D Cellular Automata Grids
export const cellular3DGridConfig = {
  defaultWidth: 20,   // Default width of the 3D cellular grid
  defaultHeight: 20,  // Default height of the 3D cellular grid
  defaultDepth: 20    // Default depth of the 3D cellular grid
};

// Initial rule set for cellular automata simulations
export const initialCellularRules = 'conway'; // e.g., 'conway', 'maze', 'coral'

// Simulation speeds for cellular automata (in milliseconds per simulation step)
export const simulationSpeeds = {
  default: 150, // Default speed
  fast: 50,     // Fast speed
  slow: 300      // Slow speed
};

// Future: This file can also hold pattern-specific parameters, initial states, etc.
// export const patternSpecificParams = {
//   flocking: { visionRadius: 50, ... },
//   neurons: { activationThreshold: 30, refractoryPeriod: 5, ... },
//   economy: { productionRate: 0.1, consumptionRate: 0.05, ... }
// };

// export const predefinedCellularPatterns = {
//   glider: { ... },
//   pulsar: { ... }
// };
