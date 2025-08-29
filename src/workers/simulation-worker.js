/**
 * Simulation Web Worker
 * Handles heavy computational tasks for simulations to prevent UI blocking
 */

// Import object pool for memory optimization
class WorkerObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.borrowed = new Set();
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    this.borrowed.add(obj);
    return obj;
  }

  release(obj) {
    if (this.borrowed.has(obj)) {
      this.borrowed.delete(obj);
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }
}

// Initialize object pools
const agentPool = new WorkerObjectPool(
  () => ({ id: 0, x: 0, y: 0, vx: 0, vy: 0, energy: 0, activation: 0, connections: [], role: 'agent' }),
  (obj) => {
    obj.id = 0;
    obj.x = 0;
    obj.y = 0;
    obj.vx = 0;
    obj.vy = 0;
    obj.energy = 0;
    obj.activation = 0;
    obj.connections.length = 0;
    obj.role = 'agent';
  },
  100
);

const cellPool = new WorkerObjectPool(
  () => ({ x: 0, y: 0, z: 0, state: 0, nextState: 0, neighbors: 0 }),
  (obj) => {
    obj.x = 0;
    obj.y = 0;
    obj.z = 0;
    obj.state = 0;
    obj.nextState = 0;
    obj.neighbors = 0;
  },
  200
);

// Cellular Automata calculations
const updateCellularAutomata = (gridData, rules, is3D = false) => {
  if (is3D) {
    return update3DCellularAutomata(gridData, rules);
  }
  
  const { grid, width, height } = gridData;
  const newGrid = new Array(height);
  
  for (let y = 0; y < height; y++) {
    newGrid[y] = new Int8Array(width);
  }
  
  // Batch process for better performance
  const batchSize = Math.min(10, height);
  for (let batch = 0; batch < height; batch += batchSize) {
    const endY = Math.min(batch + batchSize, height);
    
    for (let y = batch; y < endY; y++) {
      for (let x = 0; x < width; x++) {
        const neighbors = countNeighbors(grid, x, y, width, height);
        
        if (rules === 'conway') {
          if (grid[y][x] === 1) {
            newGrid[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
          } else {
            newGrid[y][x] = neighbors === 3 ? 1 : 0;
          }
        } else if (rules === 'maze') {
          if (grid[y][x] === 1) {
            newGrid[y][x] = (neighbors >= 1 && neighbors <= 5) ? 1 : 0;
          } else {
            newGrid[y][x] = neighbors === 3 ? 1 : 0;
          }
        }
      }
    }
  }
  
  return { grid: newGrid, width, height };
};

const update3DCellularAutomata = (gridData, rules) => {
  const { grid, width, height, depth } = gridData;
  const newGrid = new Array(depth);
  
  for (let z = 0; z < depth; z++) {
    newGrid[z] = new Array(height);
    for (let y = 0; y < height; y++) {
      newGrid[z][y] = new Int8Array(width);
    }
  }
  
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const neighbors = count3DNeighbors(grid, x, y, z, width, height, depth);
        
        if (grid[z][y][x] === 1) {
          newGrid[z][y][x] = (neighbors >= 4 && neighbors <= 6) ? 1 : 0;
        } else {
          newGrid[z][y][x] = neighbors === 5 ? 1 : 0;
        }
      }
    }
  }
  
  return { grid: newGrid, width, height, depth };
};

const countNeighbors = (grid, x, y, width, height) => {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + width) % width;
      const ny = (y + dy + height) % height;
      count += grid[ny][nx];
    }
  }
  return count;
};

const count3DNeighbors = (grid, x, y, z, width, height, depth) => {
  let count = 0;
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0 && dz === 0) continue;
        const nx = (x + dx + width) % width;
        const ny = (y + dy + height) % height;
        const nz = (z + dz + depth) % depth;
        count += grid[nz][ny][nx];
      }
    }
  }
  return count;
};

// Emergence simulation calculations
const updateEmergenceAgents = (agentsData, rules, canvasSize) => {
  const { agents, pattern } = agentsData;
  const { width, height } = canvasSize;
  const updatedAgents = [];
  
  // Pre-calculate neighbor relationships for better performance
  const neighborMap = new Map();
  const neighborRadius = 50;
  const radiusSquared = neighborRadius * neighborRadius;
  
  // Build spatial index for efficient neighbor finding
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const neighbors = [];
    
    for (let j = 0; j < agents.length; j++) {
      if (i === j) continue;
      
      const other = agents[j];
      const dx = other.x - agent.x;
      const dy = other.y - agent.y;
      const distSquared = dx * dx + dy * dy;
      
      if (distSquared < radiusSquared) {
        neighbors.push({ agent: other, distance: Math.sqrt(distSquared) });
      }
    }
    
    neighborMap.set(agent.id, neighbors);
  }
  
  // Update agents with optimized calculations
  for (const agent of agents) {
    const updatedAgent = agentPool.acquire();
    Object.assign(updatedAgent, agent);
    
    const neighbors = neighborMap.get(agent.id) || [];
    let newVx = agent.vx;
    let newVy = agent.vy;
    let newEnergy = agent.energy;
    let newActivation = agent.activation * 0.9;
    
    if (pattern === 'flocking' && neighbors.length > 0) {
      // Flocking behavior
      const avgX = neighbors.reduce((sum, n) => sum + n.agent.x, 0) / neighbors.length;
      const avgY = neighbors.reduce((sum, n) => sum + n.agent.y, 0) / neighbors.length;
      
      // Cohesion
      newVx += (avgX - agent.x) * rules.cohesion * 0.001;
      newVy += (avgY - agent.y) * rules.cohesion * 0.001;
      
      // Separation
      neighbors.forEach(({ agent: neighbor, distance }) => {
        if (distance < 25) {
          newVx -= (neighbor.x - agent.x) * rules.separation * 0.01 / distance;
          newVy -= (neighbor.y - agent.y) * rules.separation * 0.01 / distance;
        }
      });
      
      // Alignment
      const avgVx = neighbors.reduce((sum, n) => sum + n.agent.vx, 0) / neighbors.length;
      const avgVy = neighbors.reduce((sum, n) => sum + n.agent.vy, 0) / neighbors.length;
      newVx += (avgVx - agent.vx) * rules.alignment * 0.1;
      newVy += (avgVy - agent.vy) * rules.alignment * 0.1;
    } else if (pattern === 'neurons') {
      const stimulation = neighbors.reduce((sum, n) => sum + n.agent.activation, 0);
      if (stimulation > 30) {
        newActivation = 100;
        newEnergy -= 2;
      }
      newVx *= 0.95;
      newVy *= 0.95;
    }
    
    // Apply randomness and speed limits
    newVx += (Math.random() - 0.5) * rules.randomness;
    newVy += (Math.random() - 0.5) * rules.randomness;
    
    const speed = Math.sqrt(newVx * newVx + newVy * newVy);
    if (speed > rules.speed) {
      newVx = (newVx / speed) * rules.speed;
      newVy = (newVy / speed) * rules.speed;
    }
    
    // Update position with boundary wrapping
    updatedAgent.x = (agent.x + newVx + width) % width;
    updatedAgent.y = (agent.y + newVy + height) % height;
    updatedAgent.vx = newVx;
    updatedAgent.vy = newVy;
    updatedAgent.energy = Math.max(0, newEnergy);
    updatedAgent.activation = newActivation;
    
    updatedAgents.push(updatedAgent);
  }
  
  return updatedAgents;
};

// Message handler
self.addEventListener('message', (event) => {
  const { type, data, id } = event.data;
  
  try {
    let result;
    const startTime = performance.now();
    
    switch (type) {
      case 'updateCellularAutomata':
        result = updateCellularAutomata(data.gridData, data.rules, data.is3D);
        break;
        
      case 'updateEmergenceAgents':
        result = updateEmergenceAgents(data.agentsData, data.rules, data.canvasSize);
        break;
        
      case 'benchmark':
        // Simple benchmark test
        const iterations = 10000;
        let sum = 0;
        for (let i = 0; i < iterations; i++) {
          sum += Math.random() * i;
        }
        result = { iterations, sum, time: performance.now() - startTime };
        break;
        
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    const processingTime = performance.now() - startTime;
    
    self.postMessage({
      id,
      type: 'success',
      result,
      processingTime
    });
    
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Periodic cleanup
setInterval(() => {
  // Release unused objects back to pools
  if (agentPool.borrowed.size === 0 && agentPool.pool.length > 50) {
    agentPool.pool.splice(50);
  }
  if (cellPool.borrowed.size === 0 && cellPool.pool.length > 100) {
    cellPool.pool.splice(100);
  }
}, 30000);