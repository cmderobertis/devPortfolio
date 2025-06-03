// src/engine/Metrics.js

// Calculate emergent properties
export const calculateMetrics = (currentAgents, rules) => { // Added rules to signature
  if (!rules) { // Basic check for rules object
    // console.warn("calculateMetrics: Rules object is undefined.");
    return { coherence: 0, diversity: 0, efficiency: 0 };
  }
  if (currentAgents.length === 0) {
    return { coherence: 0, diversity: 0, efficiency: 0 };
  }

  const avgVx = currentAgents.reduce((sum, a) => sum + a.vx, 0) / currentAgents.length;
  const avgVy = currentAgents.reduce((sum, a) => sum + a.vy, 0) / currentAgents.length;
  // Ensure rules.speed is available and non-zero to prevent NaN or Infinity
  const coherence = rules.speed && rules.speed !== 0
    ? Math.sqrt(avgVx * avgVx + avgVy * avgVy) / rules.speed
    : 0;

  const centerX = currentAgents.reduce((sum, a) => sum + a.x, 0) / currentAgents.length;
  const centerY = currentAgents.reduce((sum, a) => sum + a.y, 0) / currentAgents.length;
  // The divisor 200 is arbitrary; consider making it configurable if possible
  const diversityDivisor = 200;
  const diversity = currentAgents.reduce((sum, a) =>
    sum + Math.hypot(a.x - centerX, a.y - centerY), 0
  ) / currentAgents.length / diversityDivisor;

  const totalEnergy = currentAgents.reduce((sum, a) => sum + a.energy, 0);
  const avgEnergy = totalEnergy / currentAgents.length;

  let efficiency = 0;
  if (avgEnergy !== 0) { // Prevent division by zero if avgEnergy is 0
    const energyVariance = currentAgents.reduce((sum, a) =>
      sum + Math.pow(a.energy - avgEnergy, 2), 0
    ) / currentAgents.length;
    // Efficiency calculation: 1 - (normalized variance). Closer to 1 is better.
    efficiency = 1 - (energyVariance / (avgEnergy * avgEnergy));
  } else if (currentAgents.every(a => a.energy === 0)) {
    efficiency = 1; // If all agents have 0 energy, variance is 0, system is "perfectly" efficient in its zero-energy state.
  }


  return {
    coherence: Math.max(0, Math.min(1, coherence || 0)), // Ensure value is between 0 and 1, default to 0 if NaN
    diversity: Math.max(0, Math.min(1, diversity || 0)),
    efficiency: Math.max(0, Math.min(1, efficiency || 0))
  };
};
