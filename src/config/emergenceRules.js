// src/config/emergenceRules.js

// Default values for agent-based simulation rules
export const defaultRules = {
  cohesion: 0.5,    // How much agents steer towards the center of mass of neighbors
  separation: 0.8,  // How much agents steer to avoid crowding neighbors
  alignment: 0.6,   // How much agents steer towards the average heading of neighbors
  randomness: 0.2,  // Amount of random movement
  speed: 1.5        // Maximum speed of agents
};

// It might be useful to have different rule sets for different patterns later
// For example:
// export const flockingRules = { ... };
// export const neuronRules = { ... };

// For now, just the default set.
