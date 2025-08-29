// TypeScript conversion of EmergenceEngineCore.js
import type { 
  Agent, 
  SimulationPattern, 
  SimulationRules, 
  InteractionRules 
} from '../types/simulation';

// Canvas interface for type safety
interface CanvasElement {
  width: number;
  height: number;
}

// Agent count configuration type
type AgentCountParams = Partial<Record<SimulationPattern, number>>;

// Enhanced agent type with position properties
interface EmergenceAgent extends Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  activation: number;
  role: 'agent' | 'producer' | 'consumer' | 'trader';
}

/**
 * Initialize agents based on simulation pattern
 * @param pattern - The simulation pattern to initialize
 * @param canvas - Canvas element for dimensions
 * @param rules - Simulation rules (currently unused in initialization)
 * @param agentCountParams - Custom agent counts per pattern
 * @returns Array of initialized agents
 */
export const initializeAgents = (
  pattern: SimulationPattern,
  canvas: CanvasElement | null,
  rules: SimulationRules,
  agentCountParams: AgentCountParams = {}
): EmergenceAgent[] => {
  // Cellular automata handled elsewhere
  if (pattern === 'cellular') {
    return [];
  }

  if (!canvas) return [];

  const { width, height } = canvas;
  
  // Determine agent count with fallbacks
  const defaultCounts: Record<SimulationPattern, number> = {
    neurons: 60,
    economy: 40,
    flocking: 80,
    cellular: 0,
    physics: 50
  };

  const agentCount = agentCountParams[pattern] ?? defaultCounts[pattern];

  return Array.from({ length: agentCount }, (_, i): EmergenceAgent => ({
    id: i,
    position: {
      x: Math.random() * width,
      y: Math.random() * height
    },
    // Legacy position properties for backward compatibility
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    energy: Math.random() * 100 + 50,
    connections: [],
    role: pattern === 'economy' 
      ? (['producer', 'consumer', 'trader'] as const)[i % 3]
      : 'agent',
    activation: 0,
    active: true,
    metadata: {}
  }));
};

/**
 * Update agents based on simulation rules and patterns
 * @param currentAgents - Current agent state
 * @param canvas - Canvas element for boundary conditions
 * @param rules - Simulation rules to apply
 * @param selectedPattern - Active simulation pattern
 * @returns Updated agents array
 */
export const updateAgents = (
  currentAgents: EmergenceAgent[],
  canvas: CanvasElement | null,
  rules: SimulationRules,
  selectedPattern: SimulationPattern
): EmergenceAgent[] => {
  if (!canvas) return currentAgents;

  const { width, height } = canvas;
  const { interaction } = rules;

  return currentAgents.map((agent): EmergenceAgent => {
    let newVx = agent.vx;
    let newVy = agent.vy;
    let newEnergy = agent.energy;
    let newActivation = agent.activation * 0.9;

    // Find nearby neighbors
    const neighbors = currentAgents.filter(other =>
      other.id !== agent.id &&
      Math.hypot(other.x - agent.x, other.y - agent.y) < (interaction.interactionRadius ?? 50)
    );

    // Apply pattern-specific behaviors
    switch (selectedPattern) {
      case 'flocking':
        if (neighbors.length > 0) {
          // Cohesion: move toward center of neighbors
          const avgX = neighbors.reduce((sum, n) => sum + n.x, 0) / neighbors.length;
          const avgY = neighbors.reduce((sum, n) => sum + n.y, 0) / neighbors.length;
          newVx += (avgX - agent.x) * (interaction.cohesion ?? 0.1) * 0.001;
          newVy += (avgY - agent.y) * (interaction.cohesion ?? 0.1) * 0.001;

          // Separation: avoid crowding neighbors
          neighbors.forEach(neighbor => {
            const dist = Math.hypot(neighbor.x - agent.x, neighbor.y - agent.y);
            if (dist < 25) { // Separation distance
              const separationForce = (interaction.separation ?? 0.1) * 0.01 / Math.max(dist, 0.1);
              newVx -= (neighbor.x - agent.x) * separationForce;
              newVy -= (neighbor.y - agent.y) * separationForce;
            }
          });

          // Alignment: match velocity of neighbors
          const avgVx = neighbors.reduce((sum, n) => sum + n.vx, 0) / neighbors.length;
          const avgVy = neighbors.reduce((sum, n) => sum + n.vy, 0) / neighbors.length;
          newVx += (avgVx - agent.vx) * (interaction.alignment ?? 0.1) * 0.1;
          newVy += (avgVy - agent.vy) * (interaction.alignment ?? 0.1) * 0.1;
        }
        break;

      case 'neurons':
        // Neural network simulation
        const stimulation = neighbors.reduce((sum, n) => sum + n.activation, 0);
        const threshold = interaction.stimulationThreshold ?? 30;
        
        if (stimulation > threshold) {
          newActivation = 100; // Fire
          newEnergy -= 2; // Energy cost for firing
        }
        
        // Velocity decay for neurons
        newVx *= 0.95;
        newVy *= 0.95;
        break;

      case 'economy':
        // Economic simulation
        neighbors.forEach(neighbor => {
          if (agent.role === 'producer' && neighbor.role === 'consumer') {
            const tradeAmount = Math.min(agent.energy * 0.1, neighbor.energy * 0.05);
            newEnergy += tradeAmount;
          } else if (agent.role === 'trader') {
            newEnergy += neighbors.length * 0.5; // Trader bonus
          }
        });
        
        // Energy bounds for economic agents
        newEnergy = Math.max(10, Math.min(200, newEnergy));
        break;

      case 'physics':
        // Basic physics simulation with gravity and friction
        newVy += rules.physics?.gravity?.y ?? 0.1; // Gravity
        newVx *= rules.physics?.friction ?? 0.99; // Friction
        newVy *= rules.physics?.friction ?? 0.99;
        break;

      default:
        // Default behavior - minimal interaction
        break;
    }

    // Add randomness
    const randomnessForce = interaction.randomness ?? 0.1;
    newVx += (Math.random() - 0.5) * randomnessForce;
    newVy += (Math.random() - 0.5) * randomnessForce;

    // Speed limiting
    const maxSpeed = rules.physics?.maxSpeed ?? interaction.interactionRadius ?? 5;
    const speed = Math.hypot(newVx, newVy);
    if (speed > maxSpeed) {
      const speedRatio = maxSpeed / speed;
      newVx *= speedRatio;
      newVy *= speedRatio;
    }

    // Position update
    let newX = agent.x + newVx;
    let newY = agent.y + newVy;

    // Boundary conditions based on environment rules
    const boundaryBehavior = rules.environment?.boundaryBehavior ?? 'wrap';
    
    switch (boundaryBehavior) {
      case 'wrap':
        if (newX < 0) newX = width;
        if (newX > width) newX = 0;
        if (newY < 0) newY = height;
        if (newY > height) newY = 0;
        break;
        
      case 'bounce':
        if (newX < 0 || newX > width) {
          newVx = -newVx;
          newX = Math.max(0, Math.min(width, newX));
        }
        if (newY < 0 || newY > height) {
          newVy = -newVy;
          newY = Math.max(0, Math.min(height, newY));
        }
        break;
        
      case 'absorb':
        newX = Math.max(0, Math.min(width, newX));
        newY = Math.max(0, Math.min(height, newY));
        if (newX === 0 || newX === width || newY === 0 || newY === height) {
          newVx *= 0.5;
          newVy *= 0.5;
        }
        break;
    }

    return {
      ...agent,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      energy: newEnergy,
      activation: newActivation,
      position: {
        x: newX,
        y: newY
      }
    };
  });
};

// Helper functions for pattern-specific logic
export const createFlockingRules = (
  cohesion = 0.1,
  separation = 0.15,
  alignment = 0.1,
  randomness = 0.05
): InteractionRules => ({
  cohesion,
  separation,
  alignment,
  randomness,
  interactionRadius: 50
});

export const createNeuronRules = (
  stimulationThreshold = 30,
  randomness = 0.02
): InteractionRules => ({
  stimulationThreshold,
  randomness,
  interactionRadius: 40
});

export const createEconomicRules = (
  randomness = 0.03
): InteractionRules => ({
  randomness,
  interactionRadius: 60
});