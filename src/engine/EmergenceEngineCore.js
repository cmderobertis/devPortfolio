// src/engine/EmergenceEngineCore.js

// Initialize agents based on pattern
export const initializeAgents = (pattern, canvas, rules, agentCountParams) => { // Added agentCountParams
  if (pattern === 'cellular') {
    // This part will be handled by CellularAutomata.js, but the function signature is needed
    // Or, this function might not be called at all if selectedPattern is 'cellular' in the main component.
    // For now, returning an empty array as per instructions.
    return [];
  }

  if (!canvas) return [];

  const width = canvas.width;
  const height = canvas.height;
  // Use agentCountParams for flexibility
  const agentCount = agentCountParams[pattern] || (pattern === 'neurons' ? 60 : pattern === 'economy' ? 40 : 80);

  return Array.from({ length: agentCount }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    energy: Math.random() * 100 + 50,
    connections: [],
    role: pattern === 'economy' ? ['producer', 'consumer', 'trader'][i % 3] : 'agent',
    activation: 0
  }));
};

// Core emergence simulation
export const updateAgents = (currentAgents, canvas, rules, selectedPattern) => {
  if (!canvas) return currentAgents;

  const width = canvas.width;
  const height = canvas.height;

  return currentAgents.map(agent => {
    let newVx = agent.vx;
    let newVy = agent.vy;
    let newEnergy = agent.energy;
    let newActivation = agent.activation * 0.9;

    const neighbors = currentAgents.filter(other =>
      other.id !== agent.id &&
      Math.hypot(other.x - agent.x, other.y - agent.y) < 50
    );

    if (selectedPattern === 'flocking') {
      if (neighbors.length > 0) {
        const avgX = neighbors.reduce((sum, n) => sum + n.x, 0) / neighbors.length;
        const avgY = neighbors.reduce((sum, n) => sum + n.y, 0) / neighbors.length;
        newVx += (avgX - agent.x) * rules.cohesion * 0.001;
        newVy += (avgY - agent.y) * rules.cohesion * 0.001;

        neighbors.forEach(neighbor => {
          const dist = Math.hypot(neighbor.x - agent.x, neighbor.y - agent.y);
          if (dist < 25) { // Separation distance
            newVx -= (neighbor.x - agent.x) * rules.separation * 0.01 / dist;
            newVy -= (neighbor.y - agent.y) * rules.separation * 0.01 / dist;
          }
        });

        const avgVx = neighbors.reduce((sum, n) => sum + n.vx, 0) / neighbors.length;
        const avgVy = neighbors.reduce((sum, n) => sum + n.vy, 0) / neighbors.length;
        newVx += (avgVx - agent.vx) * rules.alignment * 0.1;
        newVy += (avgVy - agent.vy) * rules.alignment * 0.1;
      }
    } else if (selectedPattern === 'neurons') {
      const stimulation = neighbors.reduce((sum, n) => sum + n.activation, 0);
      if (stimulation > 30) { // Stimulation threshold
        newActivation = 100; // Activation level
        newEnergy -= 2; // Energy cost for firing
      }
      newVx *= 0.95; // Velocity decay
      newVy *= 0.95;
    } else if (selectedPattern === 'economy') {
      neighbors.forEach(neighbor => {
        if (agent.role === 'producer' && neighbor.role === 'consumer') {
          const trade = Math.min(agent.energy * 0.1, neighbor.energy * 0.05); // Trade amount
          newEnergy += trade;
          // neighbor.energy -= trade; // This would require modifying neighbor directly, tricky in map
        } else if (agent.role === 'trader') {
          newEnergy += neighbors.length * 0.5; // Trader bonus
        }
      });
      newEnergy = Math.max(10, Math.min(200, newEnergy)); // Energy bounds
    }

    newVx += (Math.random() - 0.5) * rules.randomness;
    newVy += (Math.random() - 0.5) * rules.randomness;

    const speed = Math.hypot(newVx, newVy);
    if (speed > rules.speed) {
      newVx = (newVx / speed) * rules.speed;
      newVy = (newVy / speed) * rules.speed;
    }

    let newX = agent.x + newVx;
    let newY = agent.y + newVy;

    // Boundary conditions (wrapping)
    if (newX < 0) newX = width;
    if (newX > width) newX = 0;
    if (newY < 0) newY = height;
    if (newY > height) newY = 0;

    return {
      ...agent,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      energy: newEnergy,
      activation: newActivation
    };
  });
};
